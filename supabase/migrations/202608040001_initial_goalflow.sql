create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal text not null check (char_length(goal) between 3 and 1200),
  title text not null check (char_length(title) between 1 and 500),
  summary text not null default '',
  status text not null default 'active' check (status in ('active', 'archived')),
  assumptions jsonb not null default '[]'::jsonb check (jsonb_typeof(assumptions) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.plans(id) on delete cascade,
  target_step_id uuid,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('plan', 'questions', 'breakdown', 'regeneration')),
  model text not null,
  prompt_version text not null default 'v1',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.steps (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.steps(id) on delete cascade,
  generation_id uuid not null,
  depth smallint not null check (depth between 1 and 10),
  position smallint not null check (position >= 0),
  title text not null check (char_length(title) between 1 and 500),
  description text not null default '',
  estimated_minutes integer not null check (estimated_minutes > 0),
  is_completed boolean not null default false,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, parent_id, position, generation_id)
);

alter table public.ai_generations
  add constraint ai_generations_target_step_id_fkey
  foreign key (target_step_id) references public.steps(id) on delete set null;

create table public.context_questions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_step_id uuid references public.steps(id) on delete set null,
  generation_id uuid not null,
  question text not null check (char_length(question) between 1 and 500),
  reason text not null default '',
  answer text not null check (char_length(answer) <= 2000),
  position smallint not null check (position >= 0),
  created_at timestamptz not null default now()
);

create table public.completion_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  step_id uuid not null references public.steps(id) on delete cascade,
  source text not null check (source in ('manual', 'cascade', 'automatic-parent')),
  local_date date not null,
  created_at timestamptz not null default now()
);

create table public.daily_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  generation_count integer not null default 0 check (generation_count >= 0),
  primary key (user_id, usage_date)
);

create index plans_user_updated_idx on public.plans(user_id, updated_at desc);
create index steps_plan_active_idx on public.steps(plan_id, archived_at, parent_id, position);
create index steps_user_idx on public.steps(user_id);
create index context_questions_plan_idx on public.context_questions(plan_id, target_step_id, position);
create index completion_events_user_date_idx on public.completion_events(user_id, local_date desc);
create index ai_generations_user_created_idx on public.ai_generations(user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

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

create trigger validate_step_tree_before_write
before insert or update of parent_id, plan_id, user_id, depth on public.steps
for each row execute function public.validate_step_tree();

create or replace function public.set_step_completion(
  target_step_id uuid,
  target_completed boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  owner_id uuid;
  current_parent_id uuid;
  next_parent_id uuid;
  all_children_completed boolean;
  target_was_completed boolean;
  event_date date;
begin
  select user_id, parent_id, is_completed
  into owner_id, current_parent_id, target_was_completed
  from public.steps
  where id = target_step_id and archived_at is null;

  if owner_id is null or owner_id is distinct from auth.uid() then
    raise exception 'Step not found';
  end if;

  with recursive subtree as (
    select id from public.steps where id = target_step_id and archived_at is null
    union all
    select child.id
    from public.steps child
    join subtree parent on child.parent_id = parent.id
    where child.archived_at is null
  )
  update public.steps
  set
    is_completed = target_completed,
    completed_at = case when target_completed then now() else null end,
    updated_at = now()
  where id in (select id from subtree);

  while current_parent_id is not null loop
    select bool_and(is_completed)
    into all_children_completed
    from public.steps
    where parent_id = current_parent_id and archived_at is null;

    update public.steps
    set
      is_completed = coalesce(all_children_completed, false),
      completed_at = case when coalesce(all_children_completed, false) then now() else null end,
      updated_at = now()
    where id = current_parent_id
    returning parent_id into next_parent_id;

    current_parent_id := next_parent_id;
  end loop;

  if target_completed and not target_was_completed then
    select (now() at time zone coalesce(profile.timezone, 'UTC'))::date
    into event_date
    from public.profiles profile
    where profile.id = owner_id;

    insert into public.completion_events (user_id, plan_id, step_id, source, local_date)
    select owner_id, plan_id, target_step_id, 'manual', coalesce(event_date, current_date)
    from public.steps where id = target_step_id;
  end if;
end;
$$;

create or replace function public.consume_ai_quota(max_actions integer default 20)
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

  insert into public.daily_ai_usage (user_id, usage_date, generation_count)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, usage_date) do update
    set generation_count = public.daily_ai_usage.generation_count + 1
    where public.daily_ai_usage.generation_count < greatest(max_actions, 1)
  returning true into allowed;

  return coalesce(allowed, false);
end;
$$;

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.steps enable row level security;
alter table public.context_questions enable row level security;
alter table public.ai_generations enable row level security;
alter table public.completion_events enable row level security;
alter table public.daily_ai_usage enable row level security;

create policy "Users can read their profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can update their profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users own plans" on public.plans for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users own steps" on public.steps for all to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.plans
    where plans.id = steps.plan_id and plans.user_id = (select auth.uid())
  )
);

create policy "Users own context questions" on public.context_questions for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can read their generations" on public.ai_generations for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can read their completion events" on public.completion_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can read their AI usage" on public.daily_ai_usage for select to authenticated using ((select auth.uid()) = user_id);

revoke all on function public.set_step_completion(uuid, boolean) from public;
revoke all on function public.consume_ai_quota(integer) from public;
grant execute on function public.set_step_completion(uuid, boolean) to authenticated;
grant execute on function public.consume_ai_quota(integer) to authenticated;
