-- Merge migration: bucket management for admins + authenticated image uploads.

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view storage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Admins can create storage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Admins can update storage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Admins can delete storage buckets" ON storage.buckets;
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

CREATE POLICY "Authenticated can upload product images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');
