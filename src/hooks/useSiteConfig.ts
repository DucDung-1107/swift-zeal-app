import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export type SiteConfig = Record<string, string>;

const DEFAULT_CONFIG: SiteConfig = {
  brand_name: "Phúc Vinh Solar",
  logo_url: "",
  phone: "0866121617",
  zalo_number: "0866121617",
  email: "info@phucvinhsolar.vn",
  address: "",
  primary_color: "#0B4F3A",
  primary_foreground_color: "#FFFFFF",
  secondary_color: "#E6C35A",
  accent_color: "#EDEDED",
  muted_color: "#F3F4F6",
  muted_foreground_color: "#111827",
  foreground_color: "#111827",
  background_color: "#FFFFFF",
  destructive_color: "#EF4444",
  destructive_foreground_color: "#FFFFFF",
  card_color: "#FFFFFF",
  hero_banner_url: "",
  hero_title: "Đèn Năng Lượng Mặt Trời Chính Hãng",
  hero_subtitle: "Giải pháp chiếu sáng thông minh, tiết kiệm năng lượng",
  promo_banner_1_url: "",
  promo_banner_1_link: "",
  promo_banner_2_url: "",
  promo_banner_2_link: "",
  footer_text: "© 2026 Phúc Vinh Solar. All rights reserved.",
  facebook_url: "",
  youtube_url: "",
  // Header
  header_background_color: "#0B4F3A",
  header_text_color: "#FFFFFF",
  header_nav_background_color: "#111827",
  header_nav_text_color: "#FFFFFF",
  header_search_placeholder: "Tìm kiếm sản phẩm...",
  header_nav_home_label: "TRANG CHỦ",
  header_nav_products_label: "SẢN PHẨM",
  header_nav_blog_label: "BLOG",
  header_nav_about_label: "GIỚI THIỆU",
  header_login_hint: "Đăng nhập / Đăng ký",
  header_my_account_label: "Tài khoản của tôi",
  header_management_label: "Management",
  header_my_orders_label: "Đơn hàng",

  // Hero / section text
  hero_button_text: "Mua ngay",
  hero_button_link: "/collections/all",
  hero_overlay_enabled: "true",
  hero_title_color: "#FFFFFF",
  hero_subtitle_color: "#FFFFFF",
  category_banner_cta_text: "Xem chi tiết",
  top_products_title: "TOP SẢN PHẨM BÁN CHẠY",
  trending_title: "Xu hướng tìm kiếm",
  trending_cta_text: "Xem ngay",
  new_collection_title: "BỘ SƯU TẬP MỚI",
  blog_section_title: "Bài Viết Mới Nhất",
  blog_section_cta_text: "Xem tất cả",
  blog_item_cta_text: "Xem thêm",

  // Footer
  footer_background_color: "#0B4F3A",
  footer_text_color: "#EDEDED",
  footer_heading_color: "#FFFFFF",
  footer_newsletter_title: "Đăng ký nhận thông tin",
  footer_newsletter_subtitle: "Nhận tin tức và ưu đãi mới nhất",
  footer_newsletter_button_text: "ĐĂNG KÝ",
  footer_policy_title: "CHÍNH SÁCH",
  footer_guide_title: "HƯỚNG DẪN",
  footer_connect_title: "KẾT NỐI VỚI CHÚNG TÔI",
  footer_payment_title: "PHƯƠNG THỨC THANH TOÁN",
  site_title: "Phúc Vinh Solar - Đèn Năng Lượng Mặt Trời",
  site_description: "Phúc Vinh Solar - Giải pháp đèn năng lượng mặt trời chất lượng cao cho gia đình và doanh nghiệp.",
  favicon_url: "/logo.png",

  // Auth pages
  login_title: "Đăng Nhập",
  login_email_placeholder: "Email",
  login_password_placeholder: "Mật khẩu",
  login_submit_text: "Đăng Nhập",
  login_loading_text: "Đang đăng nhập...",
  login_forgot_link_text: "Quên mật khẩu?",
  login_signup_prompt_text: "Chưa có tài khoản?",
  login_signup_link_text: "Đăng ký ngay",

  signup_title: "Đăng Ký",
  signup_fullname_placeholder: "Họ và tên",
  signup_email_placeholder: "Email",
  signup_password_placeholder: "Mật khẩu (ít nhất 6 ký tự)",
  signup_submit_text: "Đăng Ký",
  signup_loading_text: "Đang đăng ký...",
  signup_login_prompt_text: "Đã có tài khoản?",
  signup_login_link_text: "Đăng nhập",
  signup_check_email_title: "Kiểm tra email của bạn",
  signup_check_email_description: "Chúng tôi đã gửi email xác nhận tới",
  signup_back_to_login_text: "Quay lại đăng nhập",

  forgot_title: "Quên mật khẩu",
  forgot_description: "Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.",
  forgot_email_placeholder: "Email",
  forgot_submit_text: "Gửi email đặt lại mật khẩu",
  forgot_loading_text: "Đang gửi...",
  forgot_back_to_login_text: "Quay lại đăng nhập",
  forgot_check_email_title: "Kiểm tra email",
  forgot_check_email_description: "Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu tới",

  reset_invalid_title: "Liên kết không hợp lệ",
  reset_invalid_description: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
  reset_request_again_text: "Yêu cầu lại",
  reset_success_title: "Đặt lại thành công!",
  reset_success_description: "Mật khẩu đã được cập nhật. Đang chuyển tới trang đăng nhập...",
  reset_title: "Đặt lại mật khẩu",
  reset_password_placeholder: "Mật khẩu mới (ít nhất 6 ký tự)",
  reset_confirm_password_placeholder: "Xác nhận mật khẩu mới",
  reset_submit_text: "Đặt lại mật khẩu",
  reset_loading_text: "Đang xử lý...",

  // Checkout page
  checkout_title: "Thanh Toán",
  checkout_empty_cart_title: "Giỏ hàng trống",
  checkout_continue_shopping_text: "Tiếp tục mua sắm",
  checkout_shipping_title: "Thông tin giao hàng",
  checkout_fullname_placeholder: "Họ và tên *",
  checkout_phone_placeholder: "Số điện thoại *",
  checkout_address_placeholder: "Địa chỉ giao hàng *",
  checkout_notes_placeholder: "Ghi chú đơn hàng (tùy chọn)",
  checkout_invoice_toggle_text: "Yêu cầu xuất hóa đơn VAT",
  checkout_invoice_company_placeholder: "Tên công ty *",
  checkout_invoice_tax_code_placeholder: "Mã số thuế *",
  checkout_invoice_address_placeholder: "Địa chỉ công ty *",
  checkout_invoice_email_placeholder: "Email nhận hóa đơn *",
  checkout_submit_text: "Xác nhận đặt hàng",
  checkout_loading_text: "Đang xử lý...",
  checkout_summary_title: "Đơn hàng",
  checkout_summary_subtotal_text: "Tạm tính",
  checkout_summary_shipping_text: "Phí vận chuyển",
  checkout_summary_shipping_free_text: "Miễn phí",
  checkout_summary_total_text: "Tổng cộng",

  // Blog detail page
  blog_detail_not_found_title: "Bài viết không tồn tại",
  blog_detail_back_to_blog_text: "Quay lại trang Blog",
  blog_detail_back_text: "Quay lại",
  blog_detail_author_name: "Phúc Vinh Solar",
  blog_detail_content_fallback: "Nội dung chi tiết đang được cập nhật. Bạn có thể liên hệ để nhận tư vấn thêm ngay hôm nay.",
};

export const DEFAULT_SITE_CONFIG = DEFAULT_CONFIG;

export const parseConfigBoolean = (value: string | undefined, fallback = false) => {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
};

let cachedConfig: SiteConfig | null = null;
let listeners: Array<(config: SiteConfig) => void> = [];
let siteConfigChannel: RealtimeChannel | null = null;

const notifyListeners = (config: SiteConfig) => {
  listeners.forEach((fn) => fn(config));
};

const subscribeToSiteConfigChanges = () => {
  if (!siteConfigChannel) {
    siteConfigChannel = supabase
      .channel('public:site_config')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_config' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
          fetchSiteConfig().then((config) => {
            cachedConfig = config;
            notifyListeners(config);
          });
        }
      })
      .subscribe();
  }
};

const unsubscribeFromSiteConfigChanges = () => {
  if (siteConfigChannel) {
    supabase.removeChannel(siteConfigChannel);
    siteConfigChannel = null;
  }
};

export const fetchSiteConfig = async (): Promise<SiteConfig> => {
  const { data } = await supabase.from("site_config").select("key, value");
  const config = { ...DEFAULT_CONFIG };
  (data || []).forEach((row: any) => {
    if (row.key) config[row.key] = row.value ?? "";
  });
  cachedConfig = config;
  return config;
};

export const updateSiteConfigKey = async (key: string, value: string) => {
  const { error } = await supabase
    .from("site_config")
    .upsert({ key, value }, { onConflict: "key" } as any);
  if (error) throw error;
  if (cachedConfig) {
    cachedConfig = { ...cachedConfig, [key]: value };
    notifyListeners(cachedConfig);
  }
};

export const upsertSiteConfigEntries = async (entries: SiteConfig) => {
  const payload = Object.entries(entries).map(([key, value]) => ({ key, value }));
  if (payload.length === 0) return;

  const { error } = await supabase.from("site_config").upsert(payload, { onConflict: "key" } as any);
  if (error) throw error;

  if (cachedConfig) {
    cachedConfig = { ...cachedConfig, ...entries };
    notifyListeners(cachedConfig);
  }
};

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>(cachedConfig ?? DEFAULT_CONFIG);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    let mounted = true;

    if (!cachedConfig) {
      fetchSiteConfig().then((c) => {
        if (mounted) {
          setConfig(c);
          setLoading(false);
        }
      });
    }

    const listener = (c: SiteConfig) => {
      if (mounted) setConfig(c);
    };
    listeners.push(listener);

    return () => {
      mounted = false;
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return { config, loading, refetch: fetchSiteConfig };
};

// Call subscribeToSiteConfigChanges when the module is loaded
subscribeToSiteConfigChanges();

// Ensure cleanup when the app is closed
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', unsubscribeFromSiteConfigChanges);
}
