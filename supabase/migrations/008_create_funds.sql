-- Money added to a balance; a hosted job's cost_usd is what spends it.
create table if not exists funds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_usd numeric not null,
  kind text not null check (kind in ('grant','purchase','subscription','refund','expiration')),
  -- The payment's id, so a replayed webhook adds nothing.
  source_id text unique,
  -- Nothing expires yet. Expiring writes an 'expiration' row for what was left.
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists funds_user_idx on funds (user_id) include (amount_usd);

-- 'openslop' is MANAGED_PROVIDER: only hosted jobs spend the balance.
create index if not exists jobs_hosted_cost_idx on jobs (user_id) include (cost_usd)
  where request->>'provider' = 'openslop' and cost_usd is not null;

alter table funds enable row level security;

create policy "funds_select_own" on funds
  for select using ((select auth.uid()) = user_id);
-- INSERT/UPDATE/DELETE only via service role (bypasses RLS).

-- Lets the balance re-read the moment spend or funds land.
alter publication supabase_realtime add table jobs, funds;

-- Security invoker, so it sums the signed-in user's rows under RLS.
create or replace function public.balance_usd()
returns numeric
language sql
stable
set search_path = ''
as $$
  select
    (select coalesce(sum(amount_usd), 0) from public.funds where user_id = auth.uid())
    - (select coalesce(sum(cost_usd), 0) from public.jobs
        where user_id = auth.uid()
          and request->>'provider' = 'openslop'
          and cost_usd is not null);
$$;

revoke execute on function public.balance_usd() from public, anon;
grant execute on function public.balance_usd() to authenticated;
