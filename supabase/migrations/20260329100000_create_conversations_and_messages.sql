-- Create conversations table for chat widget
CREATE TABLE public.conversations (
  id serial PRIMARY KEY,
  session_id text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  unread_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read conversations
CREATE POLICY "Conversations public select" ON public.conversations
FOR SELECT USING (true);

-- Allow inserts (for anonymous frontend chat sessions). Adjust for stricter policies in production.
CREATE POLICY "Conversations public insert" ON public.conversations
FOR INSERT WITH CHECK (true);

-- Create messages table
CREATE TABLE public.messages (
  id serial PRIMARY KEY,
  conversation_id integer REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read messages for the chat widget
CREATE POLICY "Messages public select" ON public.messages
FOR SELECT USING (true);

-- Allow inserts (anonymous frontend) — adjust for production use if needed
CREATE POLICY "Messages public insert" ON public.messages
FOR INSERT WITH CHECK (true);

-- Optional: create a simple index on conversation_id for performance
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON public.messages(conversation_id);
