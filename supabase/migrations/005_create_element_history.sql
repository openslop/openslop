-- Generation history: one row per set of inputs an element has been run with.
-- The project row keeps only the active result per element; every take it ever
-- had lives here so time travel survives a reload. Nothing is pruned: a take
-- the user might want back should never be dropped on their behalf.
create table if not exists element_history (
  id uuid primary key,
  project_id uuid not null references projects(id) on delete cascade,
  element_id text not null,
  connector_type text not null,
  inputs jsonb not null,
  result jsonb not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists element_history_element_idx
  on element_history (project_id, element_id, created_at desc);

alter table element_history enable row level security;

create policy "element_history_select_own" on element_history
  for select using (
    exists (
      select 1 from projects p
      where p.id = element_history.project_id and p.user_id = auth.uid()
    )
  );
create policy "element_history_insert_own" on element_history
  for insert with check (
    exists (
      select 1 from projects p
      where p.id = element_history.project_id and p.user_id = auth.uid()
    )
  );
-- Regenerating an element with unchanged inputs overwrites its take in place,
-- so the client upserts and needs update alongside insert.
create policy "element_history_update_own" on element_history
  for update using (
    exists (
      select 1 from projects p
      where p.id = element_history.project_id and p.user_id = auth.uid()
    )
  );
create policy "element_history_delete_own" on element_history
  for delete using (
    exists (
      select 1 from projects p
      where p.id = element_history.project_id and p.user_id = auth.uid()
    )
  );
