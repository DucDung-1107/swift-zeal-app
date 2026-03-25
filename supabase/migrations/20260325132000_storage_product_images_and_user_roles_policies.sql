-- Bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

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
CREATE POLICY "Public can read product images" ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
);

