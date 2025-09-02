-- USRA Supabase Schema
-- Run this in Supabase SQL editor (Project > SQL > New Query)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tables
create table if not exists public.schools (
	id uuid primary key default uuid_generate_v4(),
	created_at timestamptz default now(),
	created_by uuid references auth.users(id),
	name text not null,
	principal_name text not null,
	email text not null,
	phone text not null,
	address text not null,
	estimated_players int,
	notes text,
	-- extended fields for new registration page
	center_number text,
	school_email text,
	contact1 text,
	contact2 text,
	region text,
	district text,
	badge_url text
);

create table if not exists public.players (
	id uuid primary key default uuid_generate_v4(),
	created_at timestamptz default now(),
	created_by uuid references auth.users(id),
	school_id uuid not null references public.schools(id) on delete cascade,
	first_name text not null,
	last_name text not null,
	date_of_birth date,
	position text,
	jersey_number int,
	height_cm int,
	weight_kg int
);

create table if not exists public.contacts (
	id uuid primary key default uuid_generate_v4(),
	created_at timestamptz default now(),
	name text not null,
	email text not null,
	subject text not null,
	message text not null
);

-- Members (profiles) linked to auth.users
create table if not exists public.members (
	id uuid primary key default uuid_generate_v4(),
	created_at timestamptz default now(),
	user_id uuid unique references auth.users(id) on delete cascade,
	full_name text not null,
	nin text,
	role text,
	sex text,
	highest_qualification text,
	contact1 text,
	contact2 text,
	profile_photo_url text,
	supporting_docs_url text
);

-- Row Level Security
alter table public.schools enable row level security;
alter table public.players enable row level security;
alter table public.contacts enable row level security;
alter table public.members enable row level security;

-- Policies
-- Schools: authenticated can insert, and select only their own
create policy "schools_insert_auth" on public.schools
for insert to authenticated
with check (auth.uid() is not null);

create policy "schools_select_own" on public.schools
for select to authenticated
using (created_by = auth.uid());

create policy "schools_update_own" on public.schools
for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- Players: authenticated can manage only rows of schools they created
create policy "players_insert_auth" on public.players
for insert to authenticated
with check (
	auth.uid() is not null and
	exists (
		select 1 from public.schools s
		where s.id = players.school_id and s.created_by = auth.uid()
	)
);

create policy "players_select_own_school" on public.players
for select to authenticated
using (
	exists (
		select 1 from public.schools s
		where s.id = players.school_id and s.created_by = auth.uid()
	)
);

create policy "players_update_own_school" on public.players
for update to authenticated
using (
	exists (
		select 1 from public.schools s
		where s.id = players.school_id and s.created_by = auth.uid()
	)
)
with check (
	exists (
		select 1 from public.schools s
		where s.id = players.school_id and s.created_by = auth.uid()
	)
);

-- Contacts: anyone can insert, authenticated can select
create policy "contacts_insert_anyone" on public.contacts
for insert to anon, authenticated
with check (true);

create policy "contacts_select_auth" on public.contacts
for select to authenticated
using (true);

-- Members: user can manage their own row
create policy "members_insert_self" on public.members
for insert to authenticated
with check (user_id = auth.uid());

create policy "members_select_self" on public.members
for select to authenticated
using (user_id = auth.uid());

create policy "members_update_self" on public.members
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Triggers to stamp created_by on insert
create or replace function public.set_created_by()
returns trigger as $$
begin
	if (new.created_by is null) then
		new.created_by := auth.uid();
	end if;
	return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_set_created_by_schools on public.schools;
create trigger trg_set_created_by_schools
before insert on public.schools
for each row execute function public.set_created_by();

drop trigger if exists trg_set_created_by_players on public.players;
create trigger trg_set_created_by_players
before insert on public.players
for each row execute function public.set_created_by();

-- Helper to default members.user_id to current user if not provided
create or replace function public.set_member_user_id()
returns trigger as $$
begin
    if (new.user_id is null) then
        new.user_id := auth.uid();
    end if;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_set_member_user_id on public.members;
create trigger trg_set_member_user_id
before insert on public.members
for each row execute function public.set_member_user_id();

-- Storage buckets and policies
-- Run storage bucket creation in SQL (supported by Supabase):
-- Buckets: school-badges, profile-photos, supporting-docs
insert into storage.buckets (id, name, public) values
    ('school-badges', 'school-badges', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values
    ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values
    ('supporting-docs', 'supporting-docs', false)
on conflict (id) do nothing;

-- Storage RLS policies
create policy "Public read badges" on storage.objects for select
    to public using ( bucket_id = 'school-badges' );

create policy "Public read profile photos" on storage.objects for select
    to public using ( bucket_id = 'profile-photos' );

create policy "Users can upload to own folders" on storage.objects for insert
    to authenticated with check (
        (bucket_id in ('school-badges','profile-photos','supporting-docs'))
        and (storage.foldername(name))[1] = auth.uid()::text
    );

create policy "Users update own files" on storage.objects for update
    to authenticated using (
        (bucket_id in ('school-badges','profile-photos','supporting-docs'))
        and (storage.foldername(name))[1] = auth.uid()::text
    ) with check (
        (bucket_id in ('school-badges','profile-photos','supporting-docs'))
        and (storage.foldername(name))[1] = auth.uid()::text
    );

create policy "Users delete own files" on storage.objects for delete
    to authenticated using (
        (bucket_id in ('school-badges','profile-photos','supporting-docs'))
        and (storage.foldername(name))[1] = auth.uid()::text
    );

-- Chairperson elevated read access policies
-- Allow users with role starting with 'chair' in members to read all schools and players
create policy if not exists "schools_select_chair" on public.schools
for select to authenticated
using (
    exists (
        select 1 from public.members m
        where m.user_id = auth.uid() and lower(coalesce(m.role,'')) like 'chair%'
    )
);

create policy if not exists "players_select_chair" on public.players
for select to authenticated
using (
    exists (
        select 1 from public.members m
        where m.user_id = auth.uid() and lower(coalesce(m.role,'')) like 'chair%'
    )
);

-- Add player photo url for dashboard display
alter table public.players add column if not exists photo_url text;

-- Events and participation tracking
create table if not exists public.events (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    created_by uuid references auth.users(id),
    title text not null,
    description text,
    event_date date,
    location text
);

alter table public.events enable row level security;

-- Event participants
create table if not exists public.event_participants (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    event_id uuid not null references public.events(id) on delete cascade,
    player_id uuid not null references public.players(id) on delete cascade,
    participant_role text
);

alter table public.event_participants enable row level security;

-- Policies for events: creators manage, chair can read all
create policy if not exists "events_insert_auth" on public.events
for insert to authenticated
with check (auth.uid() is not null);

create policy if not exists "events_update_own" on public.events
for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy if not exists "events_select_creator_or_chair" on public.events
for select to authenticated
using (
    created_by = auth.uid() or
    exists (
        select 1 from public.members m
        where m.user_id = auth.uid() and lower(coalesce(m.role,'')) like 'chair%'
    )
);

-- Participants: creators of the event manage; chair can read all
create policy if not exists "participants_insert_creator" on public.event_participants
for insert to authenticated
with check (
    exists (
        select 1 from public.events e where e.id = event_id and e.created_by = auth.uid()
    )
);

create policy if not exists "participants_update_creator" on public.event_participants
for update to authenticated
using (
    exists (
        select 1 from public.events e where e.id = event_id and e.created_by = auth.uid()
    )
)
with check (
    exists (
        select 1 from public.events e where e.id = event_id and e.created_by = auth.uid()
    )
);

create policy if not exists "participants_select_creator_or_chair" on public.event_participants
for select to authenticated
using (
    exists (
        select 1 from public.events e where e.id = event_id and e.created_by = auth.uid()
    ) or
    exists (
        select 1 from public.members m
        where m.user_id = auth.uid() and lower(coalesce(m.role,'')) like 'chair%'
    )
);

-- Trigger to stamp created_by on events
drop trigger if exists trg_set_created_by_events on public.events;
create trigger trg_set_created_by_events
before insert on public.events
for each row execute function public.set_created_by();
