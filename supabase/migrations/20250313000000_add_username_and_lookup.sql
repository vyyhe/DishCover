-- Add username and email to profiles for onboarding and group member lookup.
-- Run this in Supabase SQL Editor after the main schema.

-- Add columns (email may already exist if added manually)
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists email text;

-- Unique index on username (case-insensitive, ignore empty)
create unique index if not exists profiles_username_unique
on public.profiles (lower(trim(username)))
where username is not null and trim(username) != '';

-- Sync email from auth.users on new user signup
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

-- Grant execute to authenticated users
grant execute on function public.lookup_user_for_group(text) to authenticated;

-- Backfill email for existing profiles from auth.users
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');
