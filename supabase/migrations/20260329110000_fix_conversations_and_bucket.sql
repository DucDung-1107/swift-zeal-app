-- Fix: ensure conversations & messages tables exist (idempotent)
-- and ensure product-images bucket is present.

-- Conversations table (may already exist from earlier migration)
CREATE TABLE IF NOT EXISTS public.conversations (
  id serial PRIMARY KEY,
  session_id text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  unread_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Messages table (may already exist from earlier migration)
CREATE TABLE IF NOT EXISTS public.messages (
  id serial PRIMARY KEY,
  conversation_id integer REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS conversations_session_idx ON public.conversations(session_id);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON public.messages(conversation_id);

-- Ensure public read/insert policies exist (drop first to be idempotent)
DROP POLICY IF EXISTS "Conversations public select" ON public.conversations;
CREATE POLICY "Conversations public select" ON public.conversations
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Conversations public insert" ON public.conversations;
CREATE POLICY "Conversations public insert" ON public.conversations
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Conversations public update" ON public.conversations;
CREATE POLICY "Conversations public update" ON public.conversations
FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Messages public select" ON public.messages;
CREATE POLICY "Messages public select" ON public.messages
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Messages public insert" ON public.messages;
CREATE POLICY "Messages public insert" ON public.messages
FOR INSERT WITH CHECK (true);

-- Admin management policies
DROP POLICY IF EXISTS "Admins can manage conversations" ON public.conversations;
CREATE POLICY "Admins can manage conversations" ON public.conversations
FOR ALL USING (true)
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage messages" ON public.messages;
CREATE POLICY "Admins can manage messages" ON public.messages
FOR ALL USING (true)
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Ensure product-images bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
