-- Forum access helpers + RLS policies (paid-only read/write)

-- Helper: user has forum access if admin OR active subscription OR active trial.
-- SECURITY DEFINER to avoid recursion and to keep policy code readable.
create or replace function public.has_forum_access()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    coalesce(
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.is_admin = true
      )
      or exists (
        select 1
        from public.stripe_subscriptions s
        where s.user_id = auth.uid()
          and s.status = 'active'
      )
      or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.trial_ends_at is not null
          and p.trial_ends_at > timezone('utc'::text, now())
      ),
      false
    );
$$;

-- Helper: admin check
create or replace function public.is_forum_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_admin = true
    ),
    false
  );
$$;

-- Enable RLS for forum tables
alter table public.forum_categories enable row level security;
alter table public.forum_threads enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_post_reactions enable row level security;
alter table public.forum_thread_follows enable row level security;
alter table public.forum_thread_reads enable row level security;
alter table public.forum_post_flags enable row level security;

do $$
begin
  -- forum_categories
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_categories'
      and policyname = 'Forum members can read categories'
  ) then
    create policy "Forum members can read categories"
      on public.forum_categories
      for select
      using (public.has_forum_access());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_categories'
      and policyname = 'Admins can manage categories'
  ) then
    create policy "Admins can manage categories"
      on public.forum_categories
      for all
      using (public.is_forum_admin())
      with check (public.is_forum_admin());
  end if;

  -- forum_threads
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_threads'
      and policyname = 'Forum members can read threads'
  ) then
    create policy "Forum members can read threads"
      on public.forum_threads
      for select
      using (public.has_forum_access() and is_deleted = false);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_threads'
      and policyname = 'Forum members can create threads'
  ) then
    create policy "Forum members can create threads"
      on public.forum_threads
      for insert
      with check (
        public.has_forum_access()
        and author_id = auth.uid()
        and is_deleted = false
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_threads'
      and policyname = 'Authors can update own threads'
  ) then
    create policy "Authors can update own threads"
      on public.forum_threads
      for update
      using (public.has_forum_access() and author_id = auth.uid())
      with check (public.has_forum_access() and author_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_threads'
      and policyname = 'Admins can moderate threads'
  ) then
    create policy "Admins can moderate threads"
      on public.forum_threads
      for update
      using (public.is_forum_admin())
      with check (public.is_forum_admin());
  end if;

  -- forum_posts
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_posts'
      and policyname = 'Forum members can read posts'
  ) then
    create policy "Forum members can read posts"
      on public.forum_posts
      for select
      using (public.has_forum_access() and is_deleted = false);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_posts'
      and policyname = 'Forum members can create posts'
  ) then
    create policy "Forum members can create posts"
      on public.forum_posts
      for insert
      with check (
        public.has_forum_access()
        and author_id = auth.uid()
        and is_deleted = false
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_posts'
      and policyname = 'Authors can update own posts'
  ) then
    create policy "Authors can update own posts"
      on public.forum_posts
      for update
      using (public.has_forum_access() and author_id = auth.uid())
      with check (public.has_forum_access() and author_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_posts'
      and policyname = 'Admins can moderate posts'
  ) then
    create policy "Admins can moderate posts"
      on public.forum_posts
      for update
      using (public.is_forum_admin())
      with check (public.is_forum_admin());
  end if;

  -- Reactions
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_reactions'
      and policyname = 'Forum members can read reactions'
  ) then
    create policy "Forum members can read reactions"
      on public.forum_post_reactions
      for select
      using (public.has_forum_access());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_reactions'
      and policyname = 'Forum members can react'
  ) then
    create policy "Forum members can react"
      on public.forum_post_reactions
      for insert
      with check (public.has_forum_access() and user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_reactions'
      and policyname = 'Users can remove own reactions'
  ) then
    create policy "Users can remove own reactions"
      on public.forum_post_reactions
      for delete
      using (public.has_forum_access() and user_id = auth.uid());
  end if;

  -- Follows
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_thread_follows'
      and policyname = 'Users can manage own follows'
  ) then
    create policy "Users can manage own follows"
      on public.forum_thread_follows
      for all
      using (public.has_forum_access() and user_id = auth.uid())
      with check (public.has_forum_access() and user_id = auth.uid());
  end if;

  -- Reads
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_thread_reads'
      and policyname = 'Users can manage own reads'
  ) then
    create policy "Users can manage own reads"
      on public.forum_thread_reads
      for all
      using (public.has_forum_access() and user_id = auth.uid())
      with check (public.has_forum_access() and user_id = auth.uid());
  end if;

  -- Flags
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_flags'
      and policyname = 'Users can flag posts'
  ) then
    create policy "Users can flag posts"
      on public.forum_post_flags
      for insert
      with check (public.has_forum_access() and user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'forum_post_flags'
      and policyname = 'Admins can view flags'
  ) then
    create policy "Admins can view flags"
      on public.forum_post_flags
      for select
      using (public.is_forum_admin());
  end if;
end
$$;

