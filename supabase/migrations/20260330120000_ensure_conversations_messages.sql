-- Ensure conversations/messages tables and public policies exist (idempotent)

-- Create enum app_role if missing (used by some policies/functions)
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;

-- Public policies for anonymous front-end access (adjust for production)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'conversations_public_select' AND polrelid = 'public.conversations'::regclass
  ) THEN
    CREATE POLICY conversations_public_select ON public.conversations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'conversations_public_insert' AND polrelid = 'public.conversations'::regclass
  ) THEN
    CREATE POLICY conversations_public_insert ON public.conversations FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id BIGINT REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'messages_public_select' AND polrelid = 'public.messages'::regclass
  ) THEN
    CREATE POLICY messages_public_select ON public.messages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'messages_public_insert' AND polrelid = 'public.messages'::regclass
  ) THEN
    CREATE POLICY messages_public_insert ON public.messages FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Index for performance
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS conversations_session_idx ON public.conversations(session_id);

-- Ensure foreign key constraint exists (idempotent)
ALTER TABLE public.messages ADD CONSTRAINT IF NOT EXISTS messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
