-- Create access_codes table
create table if not exists access_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  is_active boolean default true,
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
