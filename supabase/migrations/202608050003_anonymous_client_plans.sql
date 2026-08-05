-- Anonymous plans now live only in the browser session. Supabase keeps the
-- anonymous auth user solely for server-enforced AI usage and depth limits.

drop trigger if exists enforce_guest_plan_limit_before_insert on public.plans;
drop function if exists public.enforce_guest_plan_limit();

create or replace function public.prevent_anonymous_plan_storage()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if public.current_user_is_anonymous() and new.user_id = auth.uid() then
    raise exception 'Anonymous plans are temporary and cannot be stored remotely.';
  end if;

  return new;
end;
$$;

create trigger prevent_anonymous_plan_storage_before_write
before insert or update on public.plans
for each row execute function public.prevent_anonymous_plan_storage();

revoke all on function public.prevent_anonymous_plan_storage() from public;
