
CREATE TABLE public.pages (
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
