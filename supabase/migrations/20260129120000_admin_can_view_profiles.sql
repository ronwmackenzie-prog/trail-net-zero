-- Allow admins to view all profiles for moderation purposes

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'Admins can view all profiles'
  ) then
    create policy "Admins can view all profiles"
      on public.profiles
      for select
      using (public.is_forum_admin());
  end if;
end
$$;
