alter table public.plans
add column emoji text not null default '🎯'
check (char_length(emoji) between 1 and 16);
