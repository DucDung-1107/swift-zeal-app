-- Add admin management policies and indexes for chat tables

-- Ensure session_id lookup is fast
CREATE INDEX IF NOT EXISTS conversations_session_idx ON public.conversations(session_id);

-- Allow admins to update and delete conversations
CREATE POLICY "Admins can manage conversations" ON public.conversations
FOR ALL
USING (true)
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update and delete messages
CREATE POLICY "Admins can manage messages" ON public.messages
FOR ALL
USING (true)
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Note: the above FOR ALL simplifies management (SELECT/INSERT/UPDATE/DELETE) for admins.
-- If you prefer finer-grained policies, replace FOR ALL with specific FOR SELECT/INSERT/UPDATE/DELETE clauses.
