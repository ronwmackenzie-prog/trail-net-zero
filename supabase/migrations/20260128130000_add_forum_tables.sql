-- Forum tables (categories, threads, posts, reactions, follows, reads, flags)
-- Note: RLS policies are added in a follow-up migration.

create extension if not exists pgcrypto;

-- Categories
create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Threads
create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.forum_categories (id) on delete restrict,
  author_id uuid not null references auth.users (id) on delete restrict,
  title text not null,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  is_deleted boolean not null default false,
  last_post_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Posts
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete restrict,
  body text not null,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Reactions (one user can react with multiple types, but not duplicate the same type)
create table if not exists public.forum_post_reactions (
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (post_id, user_id, reaction)
);

-- Thread follows (subscriptions)
create table if not exists public.forum_thread_follows (
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (thread_id, user_id)
);

-- Thread reads (for unread counts / jump-to-last-read)
create table if not exists public.forum_thread_reads (
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  last_read_at timestamptz not null default timezone('utc'::text, now()),
  last_read_post_id uuid references public.forum_posts (id) on delete set null,
  updated_at timestamptz not null default timezone('utc'::text, now()),
  primary key (thread_id, user_id)
);

-- Post flags (basic moderation)
create table if not exists public.forum_post_flags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reason text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- Helpful indexes
create index if not exists forum_threads_category_last_post_idx
  on public.forum_threads (category_id, last_post_at desc nulls last);

create index if not exists forum_posts_thread_created_at_idx
  on public.forum_posts (thread_id, created_at asc);

create index if not exists forum_posts_author_created_at_idx
  on public.forum_posts (author_id, created_at desc);

create index if not exists forum_post_flags_post_created_at_idx
  on public.forum_post_flags (post_id, created_at desc);

-- Keep updated_at fresh (re-use existing public.set_updated_at() from earlier migrations)
drop trigger if exists set_timestamp_on_forum_categories on public.forum_categories;
create trigger set_timestamp_on_forum_categories
before update on public.forum_categories
for each row execute procedure public.set_updated_at();

drop trigger if exists set_timestamp_on_forum_threads on public.forum_threads;
create trigger set_timestamp_on_forum_threads
before update on public.forum_threads
for each row execute procedure public.set_updated_at();

drop trigger if exists set_timestamp_on_forum_posts on public.forum_posts;
create trigger set_timestamp_on_forum_posts
before update on public.forum_posts
for each row execute procedure public.set_updated_at();

drop trigger if exists set_timestamp_on_forum_thread_reads on public.forum_thread_reads;
create trigger set_timestamp_on_forum_thread_reads
before update on public.forum_thread_reads
for each row execute procedure public.set_updated_at();

-- Keep forum_threads.last_post_at in sync
create or replace function public.forum_touch_thread_last_post_at()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.forum_threads
      set last_post_at = greatest(coalesce(last_post_at, new.created_at), new.created_at)
    where id = new.thread_id;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists forum_posts_touch_thread_last_post_at on public.forum_posts;
create trigger forum_posts_touch_thread_last_post_at
after insert on public.forum_posts
for each row execute procedure public.forum_touch_thread_last_post_at();

-- Seed initial categories (idempotent by slug)
insert into public.forum_categories (slug, name, description, position)
values
  ('race-operations', 'Race Operations', 'Permits, logistics, course design, and on-event impact for trail races.', 10),
  ('apparel-footwear', 'Apparel & Footwear', 'Materials, durability, LCA, and circularity for product teams and brands.', 20),
  ('sports-nutrition', 'Sports Nutrition', 'Packaging, sourcing, and waste minimization for gels, powders, and on-course food.', 30),
  ('land-stewardship', 'Land Stewardship', 'Trail maintenance, conservation, and ecosystem restoration.', 40),
  ('data-standards', 'Data & Standards', 'Shared methodologies, data schemas, and evidence standards for claims.', 50),
  ('working-groups', 'Working Groups', 'Collaborative projects, pilots, and initiative updates.', 60)
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      position = excluded.position;

