-- Raise the registered-user daily allowance while preserving the guest
-- lifetime allowance introduced in the preceding migration.

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
      where public.daily_ai_usage.generation_count < 200
    returning true into allowed;
  end if;

  return coalesce(allowed, false);
end;
$$;

revoke all on function public.consume_ai_quota() from public;
grant execute on function public.consume_ai_quota() to authenticated;

