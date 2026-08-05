-- Guest planning uses Supabase anonymous users. Anonymous users still receive
-- the authenticated Postgres role, so the existing ownership RLS policies apply.

create table public.guest_ai_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  generation_count integer not null default 0 check (generation_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.guest_ai_usage enable row level security;

create policy "Guests can read their AI usage"
on public.guest_ai_usage
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.current_user_is_anonymous()
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;

create or replace function public.enforce_guest_plan_limit()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));

  if public.current_user_is_anonymous()
    and new.user_id = auth.uid()
    and exists (
      select 1 from public.plans
      where user_id = new.user_id and id <> new.id
    )
  then
    raise exception 'A temporary account can have one plan. Save it to create more.';
  end if;

  return new;
end;
$$;

create trigger enforce_guest_plan_limit_before_insert
before insert on public.plans
for each row execute function public.enforce_guest_plan_limit();

create or replace function public.validate_step_tree()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  parent_plan_id uuid;
  parent_user_id uuid;
  parent_depth smallint;
begin
  if public.current_user_is_anonymous() and new.depth > 3 then
    raise exception 'Save this plan to add steps beyond level 3';
  end if;

  if new.parent_id is null then
    if new.depth <> 1 then
      raise exception 'Top-level steps must have depth 1';
    end if;
    return new;
  end if;

  if new.parent_id = new.id then
    raise exception 'A step cannot be its own parent';
  end if;

  select plan_id, user_id, depth
  into parent_plan_id, parent_user_id, parent_depth
  from public.steps
  where id = new.parent_id and archived_at is null;

  if parent_plan_id is null then
    raise exception 'Parent step does not exist or is archived';
  end if;
  if parent_plan_id <> new.plan_id or parent_user_id <> new.user_id then
    raise exception 'Parent step must belong to the same plan and user';
  end if;
  if new.depth <> parent_depth + 1 or new.depth > 10 then
    raise exception 'Child depth must equal parent depth plus one and remain at most 10';
  end if;

  if tg_op = 'UPDATE' and new.parent_id is distinct from old.parent_id and exists (
    with recursive descendants as (
      select id from public.steps where parent_id = new.id and archived_at is null
      union all
      select child.id
      from public.steps child
      join descendants parent on child.parent_id = parent.id
      where child.archived_at is null
    )
    select 1 from descendants where id = new.parent_id
  ) then
    raise exception 'Moving this step would create a cycle';
  end if;

  return new;
end;
$$;

drop function if exists public.consume_ai_quota(integer);

create or replace function public.consume_ai_quota()
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  allowed boolean;
begin
  if auth.uid() is null then
    return false;
  end if;

  if public.current_user_is_anonymous() then
    insert into public.guest_ai_usage (user_id, generation_count)
    values (auth.uid(), 1)
    on conflict (user_id) do update
      set
        generation_count = public.guest_ai_usage.generation_count + 1,
        updated_at = now()
      where public.guest_ai_usage.generation_count < 8
    returning true into allowed;
  else
    insert into public.daily_ai_usage (user_id, usage_date, generation_count)
    values (auth.uid(), current_date, 1)
    on conflict (user_id, usage_date) do update
      set generation_count = public.daily_ai_usage.generation_count + 1
      where public.daily_ai_usage.generation_count < 20
    returning true into allowed;
  end if;

  return coalesce(allowed, false);
end;
$$;

-- Supabase does not automatically remove abandoned anonymous users. This
-- function is intentionally not callable by app users. Schedule it from the
-- Supabase dashboard (for example, weekly) once pg_cron is enabled.
create or replace function public.delete_expired_anonymous_users()
returns integer
language plpgsql
security definer
set search_path = auth, public, pg_temp
as $$
declare
  deleted_count integer;
begin
  delete from auth.users
  where is_anonymous is true
    and created_at < now() - interval '30 days';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.current_user_is_anonymous() from public;
revoke all on function public.enforce_guest_plan_limit() from public;
revoke all on function public.consume_ai_quota() from public;
revoke all on function public.delete_expired_anonymous_users() from public;
grant execute on function public.current_user_is_anonymous() to authenticated;
grant execute on function public.consume_ai_quota() to authenticated;
