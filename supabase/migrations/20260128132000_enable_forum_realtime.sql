-- Enable Supabase Realtime (Postgres Changes) for forum posts.
-- This allows clients to subscribe to INSERT/UPDATE/DELETE on public.forum_posts.

do $$
begin
  -- Add the table to the supabase_realtime publication if it's not already there.
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'forum_posts'
  ) then
    alter publication supabase_realtime add table public.forum_posts;
  end if;
end
$$;

