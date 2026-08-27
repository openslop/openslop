-- Autosaved snapshots of a whole project. Consecutive saves fold into the
-- newest row while the user keeps working; an idle gap starts a new one.
create table if not exists canvas_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  script text not null,
  store jsonb not null default '{}'::jsonb,
  generation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists canvas_versions_project_idx
  on canvas_versions (project_id, created_at desc);

drop trigger if exists canvas_versions_set_updated_at on canvas_versions;
create trigger canvas_versions_set_updated_at
  before update on canvas_versions
  for each row execute function public.set_updated_at();

alter table canvas_versions enable row level security;

create policy "canvas_versions_select_own" on canvas_versions
  for select using (
    exists (
      select 1 from projects p
      where p.id = canvas_versions.project_id and p.user_id = (select auth.uid())
    )
  );
create policy "canvas_versions_insert_own" on canvas_versions
  for insert with check (
    exists (
      select 1 from projects p
      where p.id = canvas_versions.project_id and p.user_id = (select auth.uid())
    )
  );
create policy "canvas_versions_update_own" on canvas_versions
  for update using (
    exists (
      select 1 from projects p
      where p.id = canvas_versions.project_id and p.user_id = (select auth.uid())
    )
  );
