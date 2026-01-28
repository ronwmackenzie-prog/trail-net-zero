-- Member Resources: admin-managed articles/resources (membership perk)

create extension if not exists pgcrypto;

create table if not exists public.member_resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  external_url text,
  kind text not null default 'article', -- article | link | update (flexible)
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists member_resources_published_idx
  on public.member_resources (is_published, published_at desc nulls last, created_at desc);

drop trigger if exists set_timestamp_on_member_resources on public.member_resources;
create trigger set_timestamp_on_member_resources
before update on public.member_resources
for each row execute procedure public.set_updated_at();

alter table public.member_resources enable row level security;

do $$
begin
  -- Members can read only published resources
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'member_resources'
      and policyname = 'Forum members can read published resources'
  ) then
    create policy "Forum members can read published resources"
      on public.member_resources
      for select
      using (public.has_forum_access() and is_published = true);
  end if;

  -- Admins can read everything
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'member_resources'
      and policyname = 'Admins can read all resources'
  ) then
    create policy "Admins can read all resources"
      on public.member_resources
      for select
      using (public.is_forum_admin());
  end if;

  -- Admins can manage resources
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'member_resources'
      and policyname = 'Admins can manage resources'
  ) then
    create policy "Admins can manage resources"
      on public.member_resources
      for all
      using (public.is_forum_admin())
      with check (public.is_forum_admin());
  end if;
end
$$;

-- Seed a few published examples (safe demo content)
insert into public.member_resources (slug, title, excerpt, body, kind, is_published, published_at)
values
  (
    'welcome',
    'Welcome: how to use the member forum effectively',
    'Posting guidelines, how to ask great questions, and how to share pilots.',
    '## Welcome\n\nThis is a member-only resource.\n\n- Share constraints and numbers.\n- Post templates when possible.\n- Keep pilots reproducible.\n',
    'article',
    true,
    timezone('utc'::text, now())
  ),
  (
    'cup-system-checklist',
    'Reusable cup system checklist (race ops)',
    'A quick checklist for planning cups: vendors, staffing, sanitation, and signage.',
    '## Checklist\n\n1. Vendor + lead times\n2. Wash logistics\n3. Volunteer training\n4. Signage + drop points\n',
    'article',
    true,
    timezone('utc'::text, now())
  ),
  (
    'lca-boundaries',
    'LCA boundaries: suggested defaults for race-day discussions',
    'A simple starting point for consistent boundaries in threads.',
    '## Suggested boundaries\n\n- Travel\n- Consumables\n- Waste\n- Energy\n',
    'article',
    true,
    timezone('utc'::text, now())
  )
on conflict (slug) do nothing;

