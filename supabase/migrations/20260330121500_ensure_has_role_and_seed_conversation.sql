-- Ensure has_role function exists and seed a test conversation/message

-- Create user_roles table if missing (used by has_role)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create or replace has_role function so policies referencing it won't fail
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- Seed a test conversation and message for frontend discovery (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.conversations WHERE session_id = 'seed-session') THEN
    INSERT INTO public.conversations (session_id, status, unread_count)
    VALUES ('seed-session', 'open', 0)
    RETURNING id INTO STRICT _conv_id;

    INSERT INTO public.messages (conversation_id, sender, content)
    VALUES (_conv_id, 'agent', 'Tin nhắn thử nghiệm: chào mừng!');
  END IF;
END$$;
