-- Provider keys a user brings themselves. The key never lives in this table:
-- Vault holds the ciphertext and this row holds only what is safe to show,
-- plus the id of the secret it stands for.
create extension if not exists supabase_vault with schema vault;

create table if not exists connectors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  secret_id uuid not null,
  last4 text not null,
  status text not null default 'unverified' check (status in ('unverified','valid','invalid')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

drop trigger if exists connectors_set_updated_at on connectors;
create trigger connectors_set_updated_at
  before update on connectors
  for each row execute function public.set_updated_at();

alter table connectors enable row level security;

create policy "connectors_select_own" on connectors
  for select using (auth.uid() = user_id);
-- INSERT/UPDATE/DELETE only via the functions below, which the service role runs.

-- A new table arrives with blanket grants for the client roles. Nothing writes
-- here except the definer functions below, and the secret id is not the user's
-- business even on their own row, so the grants come off and only the safe
-- columns go back on, readable by their owner under the policy above.
revoke all on connectors from anon, authenticated;
grant select (id, user_id, provider, last4, status, verified_at, created_at, updated_at)
  on connectors to authenticated;

-- Writing a key: one vault secret per (user, provider), replaced in place on
-- rotation so a rotated key leaves nothing behind. Re-verification is required
-- after every write, so status resets.
create or replace function public.connector_set_key(
  p_user_id uuid,
  p_provider text,
  p_key text,
  p_last4 text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret uuid;
begin
  select secret_id into v_secret
    from public.connectors
    where user_id = p_user_id and provider = p_provider;

  if v_secret is null then
    v_secret := vault.create_secret(
      p_key,
      'connector:' || p_user_id::text || ':' || p_provider,
      'OpenSlop provider key'
    );
    insert into public.connectors (user_id, provider, secret_id, last4)
      values (p_user_id, p_provider, v_secret, p_last4);
  else
    perform vault.update_secret(v_secret, p_key);
    update public.connectors
      set last4 = p_last4, status = 'unverified', verified_at = null
      where user_id = p_user_id and provider = p_provider;
  end if;
end;
$$;

create or replace function public.connector_read_key(p_user_id uuid, p_provider text)
returns text
language sql
security definer
set search_path = ''
as $$
  select s.decrypted_secret
    from public.connectors c
    join vault.decrypted_secrets s on s.id = c.secret_id
    where c.user_id = p_user_id and c.provider = p_provider;
$$;

create or replace function public.connector_delete(p_user_id uuid, p_provider text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret uuid;
begin
  delete from public.connectors
    where user_id = p_user_id and provider = p_provider
    returning secret_id into v_secret;
  if v_secret is not null then
    delete from vault.secrets where id = v_secret;
  end if;
end;
$$;

create or replace function public.connector_set_status(
  p_user_id uuid,
  p_provider text,
  p_status text
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.connectors
    set status = p_status,
        verified_at = case when p_status = 'valid' then now() else verified_at end
    where user_id = p_user_id and provider = p_provider;
$$;

-- A definer function is executable by PUBLIC unless told otherwise, and these
-- reach the vault. Only the service role, behind our own routes, may call them.
revoke execute on function public.connector_set_key(uuid, text, text, text) from public, anon, authenticated;
revoke execute on function public.connector_read_key(uuid, text) from public, anon, authenticated;
revoke execute on function public.connector_delete(uuid, text) from public, anon, authenticated;
revoke execute on function public.connector_set_status(uuid, text, text) from public, anon, authenticated;

-- Revoking from PUBLIC takes the privilege from every role, so the one role
-- that is meant to have it gets it back explicitly.
grant execute on function public.connector_set_key(uuid, text, text, text) to service_role;
grant execute on function public.connector_read_key(uuid, text) to service_role;
grant execute on function public.connector_delete(uuid, text) to service_role;
grant execute on function public.connector_set_status(uuid, text, text) to service_role;
