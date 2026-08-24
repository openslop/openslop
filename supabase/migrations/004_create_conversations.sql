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

-- One conversation per project, per user.
create unique index if not exists conversations_user_project_idx
  on conversations (user_id, project_id);

drop trigger if exists conversations_set_updated_at on conversations;
create trigger conversations_set_updated_at
  before update on conversations
  for each row execute function public.set_updated_at();

-- One row per message the panel renders. A turn is a single assistant message
-- that grows a part at a time, across as many tool steps as the loop takes, so
-- a step rewrites the row it is extending rather than adding another.
create table if not exists messages (
  conversation_id   uuid not null references conversations(id) on delete cascade,
  -- The message's own id, which the editor and the server agree on before the
  -- row exists: it is streamed with the message that a later step extends.
  message_id        text not null,
  primary key (conversation_id, message_id),
  -- Globally increasing, so ordering never depends on a client-computed value
  -- and concurrent appends cannot collide. A rewrite keeps the seq it was given.
  seq               bigint generated always as identity,
  role              text not null check (role in ('user', 'assistant', 'system')),
  -- Every part of the turn, in the shape the panel renders and the SDK converts
  -- for a vendor, so one that signs its thinking blocks gets them back byte for
  -- byte. What the turn cost and what produced it ride on the message itself.
  message           jsonb not null,
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
  for update using (auth.uid() = user_id);
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
-- Every step after the first rewrites its turn's row, which `on conflict do
-- update` cannot do without an update policy of its own.
create policy "messages_update_own" on messages
  for update using (
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
