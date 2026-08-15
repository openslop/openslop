-- Sloppy's transcript. Kept out of projects.store, which is a client-owned
-- whole-snapshot column on a debounce: folding an append-only log into it means
-- a stale save silently drops messages written since.

create table if not exists conversations (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One conversation per project.
create unique index if not exists conversations_project_idx
  on conversations (project_id);

drop trigger if exists conversations_set_updated_at on conversations;
create trigger conversations_set_updated_at
  before update on conversations
  for each row execute function public.set_updated_at();

create table if not exists messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references conversations(id) on delete cascade,
  -- Globally increasing, so ordering never depends on a client-computed value
  -- and concurrent appends cannot collide.
  seq               bigint generated always as identity,
  role              text not null check (role in ('user', 'assistant', 'tool')),
  -- The turn exactly as the model layer takes it, so a vendor that signs its
  -- thinking blocks gets them back byte for byte.
  message           jsonb not null,
  -- The resolved system prompt and model that produced an assistant turn.
  request           jsonb,
  usage             jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists messages_conversation_seq_idx
  on messages (conversation_id, seq);

alter table conversations enable row level security;
alter table messages enable row level security;

create policy "conversations_select_own" on conversations
  for select using (auth.uid() = user_id);
create policy "conversations_insert_own" on conversations
  for insert with check (auth.uid() = user_id);
create policy "conversations_update_own" on conversations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "conversations_delete_own" on conversations
  for delete using (auth.uid() = user_id);

create policy "messages_select_own" on messages
  for select using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );
create policy "messages_insert_own" on messages
  for insert with check (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );
create policy "messages_delete_own" on messages
  for delete using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );
