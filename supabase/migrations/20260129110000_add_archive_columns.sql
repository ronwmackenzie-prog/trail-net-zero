-- Add archive columns to member_resources and forum_threads

-- Resources: add is_archived column
alter table public.member_resources
  add column if not exists is_archived boolean not null default false,
  add column if not exists archived_at timestamptz;

-- Create index for filtering archived resources
create index if not exists member_resources_archived_idx
  on public.member_resources (is_archived, is_published);

-- Threads: add is_archived column (they already have is_deleted for soft delete)
alter table public.forum_threads
  add column if not exists is_archived boolean not null default false,
  add column if not exists archived_at timestamptz;

-- Create index for filtering archived threads
create index if not exists forum_threads_archived_idx
  on public.forum_threads (is_archived, category_id);

-- Update RLS policies to handle archived content properly
-- Members should not see archived resources (even if published)
drop policy if exists "Forum members can read published resources" on public.member_resources;
create policy "Forum members can read published resources"
  on public.member_resources
  for select
  using (public.has_forum_access() and is_published = true and is_archived = false);

-- Members should not see archived threads
drop policy if exists "Forum members can read threads" on public.forum_threads;

-- Note: The existing thread policies may need adjustment depending on how they're defined
-- This creates a new policy that accounts for archived status
do $$
begin
  -- Check if policy exists and drop it
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_threads'
      and policyname = 'Forum members can read non-deleted threads'
  ) then
    drop policy "Forum members can read non-deleted threads" on public.forum_threads;
  end if;
end
$$;

-- Create updated policy that excludes archived threads for regular members
create policy "Forum members can read non-deleted threads"
  on public.forum_threads
  for select
  using (
    public.has_forum_access()
    and is_deleted = false
    and (is_archived = false or public.is_forum_admin())
  );
