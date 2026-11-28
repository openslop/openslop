-- A user's open project tabs and their own agent meet on a private channel named for the user.
create policy "Users use their own agent channel"
on realtime.messages
for all
to authenticated
using (realtime.topic() = 'agent:' || (select auth.uid())::text)
with check (realtime.topic() = 'agent:' || (select auth.uid())::text);
