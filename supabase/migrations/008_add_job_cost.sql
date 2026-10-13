-- Set when a job completes, so a failed or unfinished job adds nothing to spend.
alter table jobs add column if not exists cost_usd numeric;

create or replace function public.spend_since(
  p_user_id uuid,
  p_provider text,
  p_since timestamptz
)
returns numeric
language sql
stable
set search_path = ''
as $$
  select coalesce(sum(cost_usd), 0)
    from public.jobs
    where user_id = p_user_id
      and request->>'provider' = p_provider
      and created_at >= p_since;
$$;

revoke execute on function public.spend_since(uuid, text, timestamptz) from public, anon, authenticated;
grant execute on function public.spend_since(uuid, text, timestamptz) to service_role;
