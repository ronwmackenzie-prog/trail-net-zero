-- Profiles table linked to Supabase auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can view own profile'
  ) then
    create policy "Users can view own profile"
      on public.profiles
      for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
      on public.profiles
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end
$$;

-- Stripe customers mapped to Supabase users
create table if not exists public.stripe_customers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.stripe_customers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'stripe_customers'
      and policyname = 'Users can view own stripe customer'
  ) then
    create policy "Users can view own stripe customer"
      on public.stripe_customers
      for select
      using (auth.uid() = user_id);
  end if;
end
$$;

-- Stripe subscriptions mapped to Supabase users
create table if not exists public.stripe_subscriptions (
  stripe_subscription_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null,
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.stripe_subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'stripe_subscriptions'
      and policyname = 'Users can view own subscriptions'
  ) then
    create policy "Users can view own subscriptions"
      on public.stripe_subscriptions
      for select
      using (auth.uid() = user_id);
  end if;
end
$$;

-- Trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp_on_profiles on public.profiles;
create trigger set_timestamp_on_profiles
before update on public.profiles
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_timestamp_on_stripe_customers on public.stripe_customers;
create trigger set_timestamp_on_stripe_customers
before update on public.stripe_customers
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_timestamp_on_stripe_subscriptions on public.stripe_subscriptions;
create trigger set_timestamp_on_stripe_subscriptions
before update on public.stripe_subscriptions
for each row
execute procedure public.set_updated_at();

