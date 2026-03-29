-- Fix: RLS blocks client-side upsert on user_roles.
-- Solution: SECURITY DEFINER function that bypasses RLS for admin role changes.

-- 1. Create RPC function for admin to update user roles (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
  ) THEN
    RAISE EXCEPTION 'Permission denied: only admins can change roles';
  END IF;

  -- Validate role value
  IF new_role NOT IN ('admin', 'moderator', 'user') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  -- Delete existing roles for target user
  DELETE FROM public.user_roles WHERE user_id = target_user_id;

  -- Insert the new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role::public.app_role);
END;
$$;

-- 2. Ensure product-images bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Fix storage policies (drop + recreate idempotently)
DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;

CREATE POLICY "Public can read product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
  )
);

CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
  )
)
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
  )
);

CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
  )
);

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
