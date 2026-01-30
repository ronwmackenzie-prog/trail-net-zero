-- Add welcome_seen_at column to track if user has dismissed the welcome modal
alter table public.profiles
  add column if not exists welcome_seen_at timestamptz;

-- Allow users to update this field via existing RLS policy (already have update own profile)
