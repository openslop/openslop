-- Create access_codes table
create table if not exists access_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  is_active boolean default true,
  max_uses integer default 100,
  current_uses integer default 0,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS
alter table access_codes enable row level security;

-- Allow anon to read access codes (for validation)
create policy "Allow anon to select access codes"
  on access_codes for select
  to anon
  using (true);

-- Allow anon to update current_uses (for incrementing usage)
create policy "Allow anon to update access codes"
  on access_codes for update
  to anon
  using (true)
  with check (true);

-- Seed a test code
insert into access_codes (code, is_active, max_uses, current_uses)
values ('SLOPPY', true, 100, 0)
on conflict (code) do nothing;
