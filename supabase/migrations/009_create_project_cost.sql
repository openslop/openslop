-- Security invoker, so it sums only the signed-in user's jobs under RLS.
create or replace function public.project_cost_usd(project_id uuid)
returns numeric
language sql
stable
set search_path = ''
as $$
  select coalesce(sum(cost_usd), 0) from public.jobs
  where jobs.project_id = project_cost_usd.project_id;
$$;

revoke execute on function public.project_cost_usd(uuid) from public, anon;
grant execute on function public.project_cost_usd(uuid) to authenticated;
