-- Create access_codes table
create table if not exists access_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS. No anon SELECT policy is granted; callers validate codes
-- through the security-definer RPC below so the public anon key cannot
-- enumerate every code.
alter table access_codes enable row level security;

create or replace function public.validate_access_code(p_code text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.access_codes%rowtype;
begin
  if p_code is null then
    return 'invalid';
  end if;

  select * into v_row
  from public.access_codes
  where code = upper(p_code);

  if not found then
    return 'invalid';
  end if;
  if not coalesce(v_row.is_active, false) then
    return 'inactive';
  end if;
  if v_row.expires_at is not null and v_row.expires_at < now() then
    return 'expired';
  end if;
  return 'valid';
end;
$$;

revoke all on function public.validate_access_code(text) from public;
grant execute on function public.validate_access_code(text) to anon, authenticated;
