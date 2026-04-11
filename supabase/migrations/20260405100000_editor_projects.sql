create extension if not exists pgcrypto;

create table if not exists public.editor_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  template_key text not null,
  primary_language text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.editor_project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.editor_projects (id) on delete cascade,
  path text not null,
  language text not null,
  content text not null default '',
  sort_order integer not null default 0,
  is_entry boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (project_id, path)
);

create table if not exists public.editor_project_shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.editor_projects (id) on delete cascade,
  share_slug text unique not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists editor_projects_user_id_updated_at_idx
  on public.editor_projects (user_id, updated_at desc);

create index if not exists editor_project_files_project_id_sort_order_idx
  on public.editor_project_files (project_id, sort_order, created_at);

create index if not exists editor_project_shares_project_id_idx
  on public.editor_project_shares (project_id);

create index if not exists editor_project_shares_share_slug_idx
  on public.editor_project_shares (share_slug);

create or replace function public.set_editor_projects_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_editor_project_files_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.touch_editor_project_updated_at()
returns trigger
language plpgsql
as $$
declare
  affected_project_id uuid;
begin
  affected_project_id = coalesce(new.project_id, old.project_id);

  update public.editor_projects
  set updated_at = timezone('utc', now())
  where id = affected_project_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists set_editor_projects_updated_at on public.editor_projects;
create trigger set_editor_projects_updated_at
before update on public.editor_projects
for each row
execute function public.set_editor_projects_updated_at();

drop trigger if exists set_editor_project_files_updated_at on public.editor_project_files;
create trigger set_editor_project_files_updated_at
before update on public.editor_project_files
for each row
execute function public.set_editor_project_files_updated_at();

drop trigger if exists touch_editor_projects_after_file_insert on public.editor_project_files;
create trigger touch_editor_projects_after_file_insert
after insert on public.editor_project_files
for each row
execute function public.touch_editor_project_updated_at();

drop trigger if exists touch_editor_projects_after_file_update on public.editor_project_files;
create trigger touch_editor_projects_after_file_update
after update on public.editor_project_files
for each row
execute function public.touch_editor_project_updated_at();

drop trigger if exists touch_editor_projects_after_file_delete on public.editor_project_files;
create trigger touch_editor_projects_after_file_delete
after delete on public.editor_project_files
for each row
execute function public.touch_editor_project_updated_at();

alter table public.editor_projects enable row level security;
alter table public.editor_project_files enable row level security;
alter table public.editor_project_shares enable row level security;

drop policy if exists "Users can view their own editor projects" on public.editor_projects;
create policy "Users can view their own editor projects"
on public.editor_projects
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own editor projects" on public.editor_projects;
create policy "Users can insert their own editor projects"
on public.editor_projects
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own editor projects" on public.editor_projects;
create policy "Users can update their own editor projects"
on public.editor_projects
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own editor projects" on public.editor_projects;
create policy "Users can delete their own editor projects"
on public.editor_projects
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Public can view shared editor projects" on public.editor_projects;
create policy "Public can view shared editor projects"
on public.editor_projects
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.editor_project_shares
    where editor_project_shares.project_id = editor_projects.id
  )
);

drop policy if exists "Users can view files for their own editor projects" on public.editor_project_files;
create policy "Users can view files for their own editor projects"
on public.editor_project_files
for select
to authenticated
using (
  exists (
    select 1
    from public.editor_projects
    where editor_projects.id = editor_project_files.project_id
      and editor_projects.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can insert files for their own editor projects" on public.editor_project_files;
create policy "Users can insert files for their own editor projects"
on public.editor_project_files
for insert
to authenticated
with check (
  exists (
    select 1
    from public.editor_projects
    where editor_projects.id = editor_project_files.project_id
      and editor_projects.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update files for their own editor projects" on public.editor_project_files;
create policy "Users can update files for their own editor projects"
on public.editor_project_files
for update
to authenticated
using (
  exists (
    select 1
    from public.editor_projects
    where editor_projects.id = editor_project_files.project_id
      and editor_projects.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.editor_projects
    where editor_projects.id = editor_project_files.project_id
      and editor_projects.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can delete files for their own editor projects" on public.editor_project_files;
create policy "Users can delete files for their own editor projects"
on public.editor_project_files
for delete
to authenticated
using (
  exists (
    select 1
    from public.editor_projects
    where editor_projects.id = editor_project_files.project_id
      and editor_projects.user_id = (select auth.uid())
  )
);

drop policy if exists "Public can view files for shared editor projects" on public.editor_project_files;
create policy "Public can view files for shared editor projects"
on public.editor_project_files
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.editor_project_shares
    where editor_project_shares.project_id = editor_project_files.project_id
  )
);

drop policy if exists "Public can view editor project shares" on public.editor_project_shares;
create policy "Public can view editor project shares"
on public.editor_project_shares
for select
to anon, authenticated
using (true);

drop policy if exists "Creators can insert editor project shares" on public.editor_project_shares;
create policy "Creators can insert editor project shares"
on public.editor_project_shares
for insert
to authenticated
with check ((select auth.uid()) = created_by);
