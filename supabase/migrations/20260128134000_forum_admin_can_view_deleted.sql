-- Allow admins to view deleted threads/posts for moderation.
-- (Regular members can only read non-deleted content.)

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_threads'
      and policyname = 'Admins can read all threads'
  ) then
    create policy "Admins can read all threads"
      on public.forum_threads
      for select
      using (public.is_forum_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_posts'
      and policyname = 'Admins can read all posts'
  ) then
    create policy "Admins can read all posts"
      on public.forum_posts
      for select
      using (public.is_forum_admin());
  end if;
end
$$;

