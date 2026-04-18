-- Expand site_config defaults for deep storefront customization.

INSERT INTO public.site_config (key, value)
VALUES
  ('header_background_color', '#0B4F3A'),
  ('header_text_color', '#FFFFFF'),
  ('header_nav_background_color', '#111827'),
  ('header_nav_text_color', '#FFFFFF'),
  ('header_search_placeholder', 'Tìm kiếm sản phẩm...'),
  ('header_nav_home_label', 'TRANG CHỦ'),
  ('header_nav_products_label', 'SẢN PHẨM'),
  ('header_nav_blog_label', 'BLOG'),
  ('header_nav_about_label', 'GIỚI THIỆU'),
  ('header_login_hint', 'Đăng nhập / Đăng ký'),
  ('header_my_account_label', 'Tài khoản của tôi'),
  ('header_management_label', 'Management'),
  ('header_my_orders_label', 'Đơn hàng'),

  ('hero_button_text', 'Mua ngay'),
  ('hero_button_link', '/collections/all'),
  ('hero_overlay_enabled', 'true'),
  ('hero_title_color', '#FFFFFF'),
  ('hero_subtitle_color', '#FFFFFF'),

  ('category_banner_cta_text', 'Xem chi tiết'),
  ('top_products_title', 'TOP SẢN PHẨM BÁN CHẠY'),
  ('trending_title', 'Xu hướng tìm kiếm'),
  ('trending_cta_text', 'Xem ngay'),
  ('new_collection_title', 'BỘ SƯU TẬP MỚI'),
  ('blog_section_title', 'Bài Viết Mới Nhất'),
  ('blog_section_cta_text', 'Xem tất cả'),
  ('blog_item_cta_text', 'Xem thêm'),

  ('footer_background_color', '#0B4F3A'),
  ('footer_text_color', '#EDEDED'),
  ('footer_heading_color', '#FFFFFF'),
  ('footer_newsletter_title', 'Đăng ký nhận thông tin'),
  ('footer_newsletter_subtitle', 'Nhận tin tức và ưu đãi mới nhất'),
  ('footer_newsletter_button_text', 'ĐĂNG KÝ'),
  ('footer_policy_title', 'CHÍNH SÁCH'),
  ('footer_guide_title', 'HƯỚNG DẪN'),
  ('footer_connect_title', 'KẾT NỐI VỚI CHÚNG TÔI'),
  ('footer_payment_title', 'PHƯƠNG THỨC THANH TOÁN')
ON CONFLICT (key) DO NOTHING;
