-- Archived descendants retain their parent links so plan history remains a tree.
-- Active steps must still reference an active parent.
create or replace function public.validate_step_tree()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  parent_plan_id uuid;
  parent_user_id uuid;
  parent_depth smallint;
  parent_archived_at timestamptz;
begin
  if public.current_user_is_anonymous()
    and new.archived_at is null
    and new.depth > 3
  then
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

  select plan_id, user_id, depth, archived_at
  into parent_plan_id, parent_user_id, parent_depth, parent_archived_at
  from public.steps
  where id = new.parent_id;

  if parent_plan_id is null then
    raise exception 'Parent step does not exist';
  end if;
  if new.archived_at is null and parent_archived_at is not null then
    raise exception 'An active step cannot have an archived parent';
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
