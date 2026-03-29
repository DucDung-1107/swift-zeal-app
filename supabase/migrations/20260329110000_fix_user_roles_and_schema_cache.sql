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
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Force PostgREST to reload schema cache to fix 404 errors for conversations and messages
NOTIFY pgrst, 'reload schema';
