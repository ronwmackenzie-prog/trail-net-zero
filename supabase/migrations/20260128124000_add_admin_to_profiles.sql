-- Add admin flag to profiles
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Admins can view all profiles (for future admin features)
-- Regular users can still only view their own profile
-- This policy allows admins to bypass RLS for admin operations
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Admins can view all profiles'
  ) then
    create policy "Admins can view all profiles"
      on public.profiles
      for select
      using (
        exists (
          select 1 from public.profiles
          where id = auth.uid() and is_admin = true
        )
      );
  end if;
end
$$;
