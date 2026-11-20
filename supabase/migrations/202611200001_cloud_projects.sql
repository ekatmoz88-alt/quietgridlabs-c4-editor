create extension if not exists pgcrypto;

create table if not exists public.cloud_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  project_data jsonb not null check (jsonb_typeof(project_data) = 'object'),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cloud_projects enable row level security;
revoke all on public.cloud_projects from anon;
grant select, insert, update, delete on public.cloud_projects to authenticated;

drop policy if exists "Owners can read their projects" on public.cloud_projects;
create policy "Owners can read their projects" on public.cloud_projects for select to authenticated using ((select auth.uid()) = owner_id);
drop policy if exists "Owners can create their projects" on public.cloud_projects;
create policy "Owners can create their projects" on public.cloud_projects for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists "Owners can update their projects" on public.cloud_projects;
create policy "Owners can update their projects" on public.cloud_projects for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "Owners can delete their projects" on public.cloud_projects;
create policy "Owners can delete their projects" on public.cloud_projects for delete to authenticated using ((select auth.uid()) = owner_id);

create index if not exists cloud_projects_owner_updated_idx on public.cloud_projects(owner_id, updated_at desc);
