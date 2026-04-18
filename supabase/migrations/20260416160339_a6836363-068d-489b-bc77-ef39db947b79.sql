
-- Site configuration key-value table
CREATE TABLE public.site_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Everyone can read config (frontend needs it)
CREATE POLICY "Site config readable by everyone"
ON public.site_config FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert site config"
ON public.site_config FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site config"
ON public.site_config FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site config"
ON public.site_config FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_site_config_updated_at
BEFORE UPDATE ON public.site_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default values
INSERT INTO public.site_config (key, value) VALUES
  ('brand_name', 'Phúc Vinh Solar'),
  ('logo_url', ''),
  ('phone', '0866121617'),
  ('zalo_number', '0866121617'),
  ('email', 'info@phucvinhsolar.vn'),
  ('address', ''),
  ('primary_color', '#0B4F3A'),
  ('primary_foreground_color', '#FFFFFF'),
  ('secondary_color', '#E6C35A'),
  ('accent_color', '#EDEDED'),
  ('muted_color', '#F3F4F6'),
  ('muted_foreground_color', '#111827'),
  ('foreground_color', '#111827'),
  ('background_color', '#FFFFFF'),
  ('destructive_color', '#EF4444'),
  ('destructive_foreground_color', '#FFFFFF'),
  ('card_color', '#FFFFFF'),
  ('hero_banner_url', ''),
  ('hero_title', 'Đèn Năng Lượng Mặt Trời Chính Hãng'),
  ('hero_subtitle', 'Giải pháp chiếu sáng thông minh, tiết kiệm năng lượng'),
  ('promo_banner_1_url', ''),
  ('promo_banner_1_link', ''),
  ('promo_banner_2_url', ''),
  ('promo_banner_2_link', ''),
  ('facebook_url', ''),
  ('youtube_url', ''),
  ('footer_text', '© 2026 Phúc Vinh Solar. All rights reserved.');
