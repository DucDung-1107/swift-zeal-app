-- Fix: ensure has_role uses correct enum casting for storage policies.

-- Ensure the product-images bucket is present and policies are defined safely.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = EXCLUDED.public;

DROP POLICY IF EXISTS "Admins can view storage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Admins can create storage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Admins can update storage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Admins can delete storage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Authenticated can view product image bucket" ON storage.buckets;
DROP POLICY IF EXISTS "Authenticated can create product image bucket" ON storage.buckets;

CREATE POLICY "Admins can view storage buckets" ON storage.buckets
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can create storage buckets" ON storage.buckets
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update storage buckets" ON storage.buckets
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete storage buckets" ON storage.buckets
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authenticated can view product image bucket" ON storage.buckets
FOR SELECT TO authenticated
USING (id = 'product-images');

CREATE POLICY "Authenticated can create product image bucket" ON storage.buckets
FOR INSERT TO authenticated
WITH CHECK (
  id = 'product-images'
  AND name = 'product-images'
  AND public = true
);

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Client can read because bucket is public; keep an explicit policy too.
CREATE POLICY "Public can read product images" ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

