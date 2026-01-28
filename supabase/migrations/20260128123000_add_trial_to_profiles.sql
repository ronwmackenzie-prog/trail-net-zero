-- Add free trial fields to profiles
alter table public.profiles
  add column if not exists trial_starts_at timestamptz,
  add column if not exists trial_ends_at timestamptz;

-- Automatically create a profile with trial window when a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, trial_starts_at, trial_ends_at)
  values (
    new.id,
    new.email,
    timezone('utc'::text, now()),
    timezone('utc'::text, now()) + interval '14 days'
  )
  on conflict (id) do update
    set trial_starts_at = excluded.trial_starts_at,
        trial_ends_at = excluded.trial_ends_at;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

