alter table public.steps
  drop constraint if exists steps_estimated_minutes_check;

alter table public.steps
  add constraint steps_estimated_minutes_check
  check (estimated_minutes >= 0);

comment on column public.steps.estimated_minutes is
  'Whole minutes; 0 is the special value for a step estimated at under one minute.';
