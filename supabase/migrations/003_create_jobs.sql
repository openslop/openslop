-- Async generation jobs. One row per /api/v1/{asset} request; queue consumer writes status+result.
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  connector_type text not null,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  request jsonb not null,
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_user_created_idx
  on jobs (user_id, created_at desc);
create index if not exists jobs_project_created_idx
  on jobs (project_id, created_at desc) where project_id is not null;

drop trigger if exists jobs_set_updated_at on jobs;
create trigger jobs_set_updated_at
  before update on jobs
  for each row execute function public.set_updated_at();

alter table jobs enable row level security;

create policy "jobs_select_own" on jobs
  for select using (auth.uid() = user_id);
create policy "jobs_insert_own" on jobs
  for insert with check (auth.uid() = user_id);
-- UPDATE/DELETE only via service role (bypasses RLS).
