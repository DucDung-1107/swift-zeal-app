-- Merge migration: allow authenticated users to bootstrap product image storage.

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view storage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Admins can create storage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Admins can update storage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Admins can delete storage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Authenticated can view product image bucket" ON storage.buckets;
DROP POLICY IF EXISTS "Authenticated can create product image bucket" ON storage.buckets;
DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;

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

-- Allow logged-in users to read/create only the product-images bucket.
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

CREATE POLICY "Authenticated can upload product images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');
