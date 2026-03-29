-- AUTO-GENERATED: COMBINED ALL MIGRATIONS FOR A NEW PROJECT

-- ==========================================
-- File: 20260324100845_b6816649-fffe-4181-8129-2d910270354d.sql
-- ==========================================
-- Create profiles table for users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER,
  discount INTEGER,
  brand TEXT NOT NULL DEFAULT 'PV SOLAR',
  image_url TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  has_gift BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);

-- Admin role for managing products
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can manage products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- File: 20260324100903_2e82410a-c591-4e3c-ac01-ee92c9549d8c.sql
-- ==========================================
-- Add RLS policy for user_roles table
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- File: 20260324102418_90df6f7a-b781-416d-b611-48076dc6b0bd.sql
-- ==========================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  total integer NOT NULL DEFAULT 0,
  full_name text NOT NULL,
  phone text NOT NULL,
  shipping_address text NOT NULL,
  notes text,
  invoice_requested boolean NOT NULL DEFAULT false,
  invoice_company_name text,
  invoice_tax_code text,
  invoice_address text,
  invoice_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price integer NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Order items policies
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger for orders
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ==========================================
-- File: 20260325120000_add_services_and_blog_posts.sql
-- ==========================================
-- Services table (header/value propositions)
CREATE TABLE IF NOT EXISTS services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  icon_key text NOT NULL DEFAULT 'shield',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services viewable by everyone" ON public.services
FOR SELECT USING (true);

-- Admin manage policies
CREATE POLICY "Admins can insert services" ON public.services
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update services" ON public.services
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete services" ON public.services
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  image_url text,
  content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog posts viewable by everyone" ON public.blog_posts
FOR SELECT USING (true);

CREATE POLICY "Admins can insert blog posts" ON public.blog_posts
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog posts" ON public.blog_posts
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog posts" ON public.blog_posts
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();



-- ==========================================
-- File: 20260325132000_storage_product_images_and_user_roles_policies.sql
-- ==========================================
-- Bucket for product images


-- Ensure RLS policies exist for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Admin can manage user roles
CREATE POLICY "Admins can view user roles" ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert user roles" ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles" ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles" ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Storage objects policies for product images
-- (Client can read because bucket is public; admin can upload/update/delete)










-- ==========================================
-- File: 20260325142000_fix_storage_policies_cast_admin.sql
-- ==========================================
-- Fix: ensure has_role uses correct enum casting for storage policies.








-- Client can read because bucket is public; keep an explicit policy too.










-- ==========================================
-- File: 20260326062932_06fd9548-5499-46cd-8be2-4adbeb2fef3f.sql
-- ==========================================

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pages viewable by everyone" ON public.pages FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage pages" ON public.pages FOR INSERT TO public WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update pages" ON public.pages FOR UPDATE TO public USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete pages" ON public.pages FOR DELETE TO public USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.pages (title, slug, content, sort_order) VALUES
  ('Chính sách bảo hành', 'chinh-sach-bao-hanh', '', 1),
  ('Chính sách đổi trả', 'chinh-sach-doi-tra', '', 2),
  ('Chính sách vận chuyển', 'chinh-sach-van-chuyen', '', 3),
  ('Chính sách bảo mật', 'chinh-sach-bao-mat', '', 4),
  ('Điều khoản dịch vụ', 'dieu-khoan-dich-vu', '', 5),
  ('Hướng dẫn mua hàng', 'huong-dan-mua-hang', '', 6),
  ('Hướng dẫn thanh toán', 'huong-dan-thanh-toan', '', 7),
  ('Hướng dẫn lắp đặt', 'huong-dan-lap-dat', '', 8),
  ('Liên hệ', 'lien-he', '', 9);


-- ==========================================
-- File: 20260328072009_840b8625-f4e8-425a-95c4-af4c6f280a72.sql
-- ==========================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;


-- ==========================================
-- File: 20260329093000_allow_authenticated_insert_product_images.sql
-- ==========================================
-- Merge migration: allow authenticated users to bootstrap product image storage.




















-- Allow logged-in users to read/create only the product-images bucket.






-- Create conversations table (chat session metadata)
CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    status VARCHAR(60) NOT NULL DEFAULT 'open',
    unread_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select conversations"
ON conversations
FOR SELECT
USING (auth.uid() IS NOT NULL OR auth.role() = 'anon');

CREATE POLICY "Allow public insert conversations"
ON conversations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'anon');

CREATE POLICY "Allow public update conversations"
ON conversations
FOR UPDATE
USING (auth.uid() IS NOT NULL OR auth.role() = 'anon')
WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'anon');

-- Create messages table (chat content)
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id BIGINT,
    content TEXT NOT NULL,
    sender VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add optional FK for conversation link
DO $$ BEGIN
  ALTER TABLE messages
    ADD CONSTRAINT messages_conversation_id_fkey
    FOREIGN KEY (conversation_id)
    REFERENCES conversations (id)
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enable Realtime on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow realtime access for public users"
ON messages
FOR SELECT
USING (auth.uid() IS NOT NULL OR auth.role() = 'anon');

CREATE POLICY "Allow insert for public users"
ON messages
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'anon');


-- ==========================================
-- File: 20260329100000_create_conversations_and_messages.sql
-- ==========================================
-- Create conversations table for chat widget
CREATE TABLE IF NOT EXISTS conversations (
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
CREATE TABLE IF NOT EXISTS messages (
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


-- ==========================================
-- File: 20260329101000_update_conversations_messages_policies.sql
-- ==========================================
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


-- ==========================================
-- File: 20260329110000_fix_user_roles_and_schema_cache.sql
-- ==========================================
-- Fix missing cast to public.app_role in user_roles policies
DROP POLICY IF EXISTS "Admins can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;

CREATE POLICY "Admins can view user roles" ON public.user_roles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert user roles" ON public.user_roles
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update user roles" ON public.user_roles
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete user roles" ON public.user_roles
FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Ensure product-images bucket exists and is public


-- Force PostgREST to reload schema cache to fix 404 errors for conversations and messages
NOTIFY pgrst, 'reload schema';


-- ==========================================
-- File: RUN_THIS_IN_SUPABASE_SQL_EDITOR.sql
-- ==========================================
-- Run this entire script in your Supabase Dashboard -> SQL Editor

-- 1. Ensure enum app_role exists (catch duplicate)
DO $$
BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN
    NULL;
END
$$;

-- 2. Ensure user_roles table exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Ensure bucket exists and has the correct policies












-- 4. Ensure conversations and messages tables exist
CREATE TABLE IF NOT EXISTS public.conversations (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    status VARCHAR(60) NOT NULL DEFAULT 'open',
    unread_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public select conversations" ON public.conversations;
  DROP POLICY IF EXISTS "Allow public insert conversations" ON public.conversations;
  DROP POLICY IF EXISTS "Allow public update conversations" ON public.conversations;
  DROP POLICY IF EXISTS "Conversations public select" ON public.conversations;
  DROP POLICY IF EXISTS "Conversations public insert" ON public.conversations;
EXCEPTION WHEN undefined_table THEN
  NULL;
END
$$;

CREATE POLICY "Allow public select conversations"
ON public.conversations FOR SELECT
USING (auth.uid() IS NOT NULL OR auth.role() = 'anon');

CREATE POLICY "Allow public insert conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'anon');

CREATE POLICY "Allow public update conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() IS NOT NULL OR auth.role() = 'anon')
WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'anon');

CREATE TABLE IF NOT EXISTS public.messages (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    conversation_id BIGINT,
    content TEXT NOT NULL,
    sender VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.messages
    ADD CONSTRAINT messages_conversation_id_fkey
    FOREIGN KEY (conversation_id)
    REFERENCES public.conversations (id)
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow realtime access for public users" ON public.messages;
  DROP POLICY IF EXISTS "Allow insert for public users" ON public.messages;
  DROP POLICY IF EXISTS "Messages public select" ON public.messages;
  DROP POLICY IF EXISTS "Messages public insert" ON public.messages;
EXCEPTION WHEN undefined_table THEN
  NULL;
END
$$;

CREATE POLICY "Allow realtime access for public users"
ON public.messages FOR SELECT
USING (auth.uid() IS NOT NULL OR auth.role() = 'anon');

CREATE POLICY "Allow insert for public users"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'anon');

-- 5. Fix admin roles policies using inline check
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can view user roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
EXCEPTION WHEN undefined_table THEN
  NULL;
END
$$;

CREATE POLICY "Admins can view user roles" ON public.user_roles
FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'));

CREATE POLICY "Admins can insert user roles" ON public.user_roles
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'));

CREATE POLICY "Admins can update user roles" ON public.user_roles
FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'));

CREATE POLICY "Admins can delete user roles" ON public.user_roles
FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'));

-- 6. Reload PostgREST Cache so your app can see the tables!
NOTIFY pgrst, 'reload schema';


