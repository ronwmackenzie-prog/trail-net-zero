-- Fix infinite recursion in profiles RLS policies
-- The old "Admins can view all profiles" policy directly queried the profiles table,
-- which triggered another policy check, causing infinite recursion.

-- Drop the problematic recursive policy
drop policy if exists "Admins can view all profiles" on public.profiles;

-- Recreate using the SECURITY DEFINER function which bypasses RLS
-- The "Users can view own profile" policy already handles auth.uid() = id,
-- so this policy only needs to handle the admin case.
create policy "Admins can view all profiles"
  on public.profiles
  for select
  using (public.is_forum_admin());
