-- Enable required extension
create extension if not exists pgcrypto;

-- profiles table
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);

create or replace function public.set_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_profiles_updated_at();

-- quotes table
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  pickup text not null,
  delivery text not null,
  make text not null,
  model text not null,
  transport_type text not null check (transport_type in ('open','enclosed')),
  pickup_date date,
  status text not null default 'new' check (status in ('new','contacted','booked','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quotes_user_id on public.quotes(user_id);
create index if not exists idx_quotes_created_at on public.quotes(created_at desc);

create or replace function public.set_quotes_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_quotes_updated_at on public.quotes;
create trigger trg_quotes_updated_at
before update on public.quotes
for each row execute function public.set_quotes_updated_at();

-- newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id bigserial primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- helper: is_admin
create or replace function public.is_admin(uid uuid)
returns boolean
language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = uid and p.role = 'admin'
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.quotes enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- profiles policies
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (auth.uid() = user_id);

-- quotes policies
drop policy if exists quotes_select_self on public.quotes;
create policy quotes_select_self on public.quotes for select
  using (user_id is null or auth.uid() = user_id);

drop policy if exists quotes_insert_self on public.quotes;
create policy quotes_insert_self on public.quotes for insert
  with check (user_id is null or auth.uid() = user_id);

-- newsletter policies
drop policy if exists newsletter_insert_any on public.newsletter_subscribers;
create policy newsletter_insert_any on public.newsletter_subscribers for insert
  with check (true);

