-- Run this in Supabase SQL Editor.
-- Enables: accounts (auth.users), profile preferences, friends, and groups with RLS.

create extension if not exists "pgcrypto";

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  username text,
  email text,
  cannot_eat text[] not null default '{}',
  prefer_not text[] not null default '{}',
  likes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_username_unique
on public.profiles (lower(trim(username)))
where username is not null and trim(username) != '';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile when a new user signs up (so preferences can be saved immediately)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, '', coalesce(new.email, ''))
  on conflict (id) do update set email = coalesce(excluded.email, profiles.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Friends ----------
-- Directed edge: owner_id -> friend_user_id (so each user controls their own friend list)
create table if not exists public.friend_edges (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  friend_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (owner_id, friend_user_id),
  check (owner_id <> friend_user_id)
);

-- ---------- Groups ----------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  added_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.friend_edges enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- Profiles: users can read/update their own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

-- Allow group owners to read profiles of their group members (for suggestions).
drop policy if exists "profiles_select_group_members_for_owner" on public.profiles;
create policy "profiles_select_group_members_for_owner"
on public.profiles for select
using (
  exists (
    select 1
    from public.group_members gm
    join public.groups g on g.id = gm.group_id
    where gm.user_id = profiles.id
      and g.owner_id = auth.uid()
  )
);


drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Friend edges: only owner can manage
drop policy if exists "friends_select_own" on public.friend_edges;
create policy "friends_select_own"
on public.friend_edges for select
using (auth.uid() = owner_id);

drop policy if exists "friends_insert_own" on public.friend_edges;
create policy "friends_insert_own"
on public.friend_edges for insert
with check (auth.uid() = owner_id);

drop policy if exists "friends_delete_own" on public.friend_edges;
create policy "friends_delete_own"
on public.friend_edges for delete
using (auth.uid() = owner_id);

-- Groups: only owner can read/write
drop policy if exists "groups_select_own" on public.groups;
create policy "groups_select_own"
on public.groups for select
using (auth.uid() = owner_id);

drop policy if exists "groups_insert_own" on public.groups;
create policy "groups_insert_own"
on public.groups for insert
with check (auth.uid() = owner_id);

drop policy if exists "groups_delete_own" on public.groups;
create policy "groups_delete_own"
on public.groups for delete
using (auth.uid() = owner_id);

-- Group members: only group owner can manage; group owner can read members
drop policy if exists "group_members_select_owner" on public.group_members;
create policy "group_members_select_owner"
on public.group_members for select
using (
  exists (
    select 1 from public.groups g
    where g.id = group_id and g.owner_id = auth.uid()
  )
);

drop policy if exists "group_members_insert_owner" on public.group_members;
create policy "group_members_insert_owner"
on public.group_members for insert
with check (
  exists (
    select 1 from public.groups g
    where g.id = group_id and g.owner_id = auth.uid()
  )
);

drop policy if exists "group_members_delete_owner" on public.group_members;
create policy "group_members_delete_owner"
on public.group_members for delete
using (
  exists (
    select 1 from public.groups g
    where g.id = group_id and g.owner_id = auth.uid()
  )
);

-- RPC: Check if username is available (for onboarding)
create or replace function public.check_username_available(uname text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  taken boolean;
begin
  uname := lower(trim(uname));
  if uname = '' then
    return false;
  end if;
  select exists(
    select 1 from profiles
    where lower(trim(username)) = uname and id != uid
  ) into taken;
  return not taken;
end;
$$;
grant execute on function public.check_username_available(text) to authenticated;

-- RPC: Look up user by email or username (for adding to groups)
create or replace function public.lookup_user_for_group(contact text)
returns table (user_id uuid, display_name text)
language plpgsql
security definer
set search_path = public
as $$
begin
  contact := trim(contact);
  if contact = '' then
    return;
  end if;
  return query
  select p.id, coalesce(p.display_name, '')
  from public.profiles p
  where (p.email ilike contact or p.username ilike contact)
  limit 1;
end;
$$;
grant execute on function public.lookup_user_for_group(text) to authenticated;

