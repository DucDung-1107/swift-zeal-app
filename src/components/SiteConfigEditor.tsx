import { useState, useEffect, useRef } from "react";
import { useSiteConfig, updateSiteConfigKey, fetchSiteConfig, upsertSiteConfigEntries, type SiteConfig } from "@/hooks/useSiteConfig";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, Eye, Palette, Phone, Image, Type, Loader2, ExternalLink, Download, FileJson } from "lucide-react";

const CONFIG_SECTIONS = [
  {
    title: "Theme tổng thể",
    icon: Palette,
    fields: [
      { key: "background_color", label: "Màu nền trang", type: "color" },
      { key: "foreground_color", label: "Màu chữ chính", type: "color" },
      { key: "card_color", label: "Màu card", type: "color" },
      { key: "muted_color", label: "Màu vùng phụ", type: "color" },
      { key: "muted_foreground_color", label: "Màu chữ vùng phụ", type: "color" },
      { key: "primary_color", label: "Màu primary", type: "color" },
      { key: "primary_foreground_color", label: "Màu chữ trên primary", type: "color" },
      { key: "secondary_color", label: "Màu secondary", type: "color" },
      { key: "accent_color", label: "Màu accent", type: "color" },
      { key: "destructive_color", label: "Màu cảnh báo", type: "color" },
      { key: "destructive_foreground_color", label: "Màu chữ cảnh báo", type: "color" },
    ],
  },
  {
    title: "Thương hiệu",
    icon: Type,
    fields: [
      { key: "brand_name", label: "Tên thương hiệu", type: "text" },
      { key: "site_title", label: "Tiêu đề trang", type: "text" },
      { key: "site_description", label: "Mô tả trang", type: "text" },
      { key: "favicon_url", label: "Favicon URL", type: "text" },
      { key: "logo_url", label: "Logo (URL hoặc upload)", type: "image" },
    ],
  },
  {
    title: "Header & Navigation",
    icon: Type,
    fields: [
      { key: "header_background_color", label: "Màu nền header", type: "color" },
      { key: "header_text_color", label: "Màu chữ header", type: "color" },
      { key: "header_nav_background_color", label: "Màu nền thanh menu", type: "color" },
      { key: "header_nav_text_color", label: "Màu chữ thanh menu", type: "color" },
      { key: "header_search_placeholder", label: "Placeholder ô tìm kiếm", type: "text" },
      { key: "header_nav_home_label", label: "Nhãn menu Trang chủ", type: "text" },
      { key: "header_nav_products_label", label: "Nhãn menu Sản phẩm", type: "text" },
      { key: "header_nav_blog_label", label: "Nhãn menu Blog", type: "text" },
      { key: "header_nav_about_label", label: "Nhãn menu Giới thiệu", type: "text" },
      { key: "header_login_hint", label: "Dòng nhắc đăng nhập", type: "text" },
      { key: "header_my_account_label", label: "Nhãn tài khoản", type: "text" },
      { key: "header_management_label", label: "Nhãn Management", type: "text" },
      { key: "header_my_orders_label", label: "Nhãn đơn hàng", type: "text" },
    ],
  },
  {
    title: "Liên hệ",
    icon: Phone,
    fields: [
      { key: "phone", label: "Số điện thoại", type: "text" },
      { key: "zalo_number", label: "Số Zalo", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "address", label: "Địa chỉ", type: "text" },
    ],
  },
  {
    title: "Banner chính",
    icon: Image,
    fields: [
      { key: "hero_banner_url", label: "Ảnh banner hero (URL hoặc upload)", type: "image" },
      { key: "hero_title", label: "Tiêu đề hero", type: "text" },
      { key: "hero_subtitle", label: "Phụ đề hero", type: "text" },
      { key: "hero_button_text", label: "Text nút hero", type: "text" },
      { key: "hero_button_link", label: "Link nút hero", type: "text" },
      { key: "hero_overlay_enabled", label: "Hiển thị overlay hero", type: "boolean" },
      { key: "hero_title_color", label: "Màu tiêu đề hero", type: "color" },
      { key: "hero_subtitle_color", label: "Màu phụ đề hero", type: "color" },
    ],
  },
  {
    title: "Banner quảng cáo",
    icon: Image,
    fields: [
      { key: "promo_banner_1_url", label: "Banner QC 1 (URL hoặc upload)", type: "image" },
      { key: "promo_banner_1_link", label: "Link banner QC 1", type: "text" },
      { key: "promo_banner_2_url", label: "Banner QC 2 (URL hoặc upload)", type: "image" },
      { key: "promo_banner_2_link", label: "Link banner QC 2", type: "text" },
    ],
  },
  {
    title: "Section nội dung",
    icon: Type,
    fields: [
      { key: "category_banner_cta_text", label: "Text CTA danh mục", type: "text" },
      { key: "top_products_title", label: "Tiêu đề Top sản phẩm", type: "text" },
      { key: "trending_title", label: "Tiêu đề Xu hướng", type: "text" },
      { key: "trending_cta_text", label: "Text CTA Xu hướng", type: "text" },
      { key: "new_collection_title", label: "Tiêu đề Bộ sưu tập mới", type: "text" },
      { key: "blog_section_title", label: "Tiêu đề Blog", type: "text" },
      { key: "blog_section_cta_text", label: "Text CTA Blog", type: "text" },
      { key: "blog_item_cta_text", label: "Text CTA card Blog", type: "text" },
    ],
  },
  {
    title: "Auth - Đăng nhập/Đăng ký",
    icon: Type,
    fields: [
      { key: "login_title", label: "Tiêu đề đăng nhập", type: "text" },
      { key: "login_email_placeholder", label: "Placeholder email đăng nhập", type: "text" },
      { key: "login_password_placeholder", label: "Placeholder mật khẩu đăng nhập", type: "text" },
      { key: "login_submit_text", label: "Nút đăng nhập", type: "text" },
      { key: "login_loading_text", label: "Text loading đăng nhập", type: "text" },
      { key: "login_forgot_link_text", label: "Link quên mật khẩu", type: "text" },
      { key: "login_signup_prompt_text", label: "Prompt đăng ký", type: "text" },
      { key: "login_signup_link_text", label: "Link đăng ký", type: "text" },
      { key: "signup_title", label: "Tiêu đề đăng ký", type: "text" },
      { key: "signup_fullname_placeholder", label: "Placeholder họ tên đăng ký", type: "text" },
      { key: "signup_email_placeholder", label: "Placeholder email đăng ký", type: "text" },
      { key: "signup_password_placeholder", label: "Placeholder mật khẩu đăng ký", type: "text" },
      { key: "signup_submit_text", label: "Nút đăng ký", type: "text" },
      { key: "signup_loading_text", label: "Text loading đăng ký", type: "text" },
      { key: "signup_login_prompt_text", label: "Prompt quay lại đăng nhập", type: "text" },
      { key: "signup_login_link_text", label: "Link quay lại đăng nhập", type: "text" },
      { key: "signup_check_email_title", label: "Tiêu đề sau đăng ký", type: "text" },
      { key: "signup_check_email_description", label: "Mô tả sau đăng ký", type: "text" },
      { key: "signup_back_to_login_text", label: "Nút về đăng nhập", type: "text" },
    ],
  },
  {
    title: "Auth - Quên/Đặt lại mật khẩu",
    icon: Type,
    fields: [
      { key: "forgot_title", label: "Tiêu đề quên mật khẩu", type: "text" },
      { key: "forgot_description", label: "Mô tả quên mật khẩu", type: "text" },
      { key: "forgot_email_placeholder", label: "Placeholder email quên mật khẩu", type: "text" },
      { key: "forgot_submit_text", label: "Nút gửi email", type: "text" },
      { key: "forgot_loading_text", label: "Text loading gửi email", type: "text" },
      { key: "forgot_back_to_login_text", label: "Link về đăng nhập", type: "text" },
      { key: "forgot_check_email_title", label: "Tiêu đề đã gửi email", type: "text" },
      { key: "forgot_check_email_description", label: "Mô tả đã gửi email", type: "text" },
      { key: "reset_invalid_title", label: "Tiêu đề link reset invalid", type: "text" },
      { key: "reset_invalid_description", label: "Mô tả link reset invalid", type: "text" },
      { key: "reset_request_again_text", label: "Link yêu cầu lại", type: "text" },
      { key: "reset_success_title", label: "Tiêu đề reset thành công", type: "text" },
      { key: "reset_success_description", label: "Mô tả reset thành công", type: "text" },
      { key: "reset_title", label: "Tiêu đề trang reset", type: "text" },
      { key: "reset_password_placeholder", label: "Placeholder mật khẩu mới", type: "text" },
      { key: "reset_confirm_password_placeholder", label: "Placeholder xác nhận mật khẩu", type: "text" },
      { key: "reset_submit_text", label: "Nút đặt lại mật khẩu", type: "text" },
      { key: "reset_loading_text", label: "Text loading đặt lại mật khẩu", type: "text" },
    ],
  },
  {
    title: "Checkout",
    icon: Type,
    fields: [
      { key: "checkout_title", label: "Tiêu đề checkout", type: "text" },
      { key: "checkout_empty_cart_title", label: "Text giỏ trống", type: "text" },
      { key: "checkout_continue_shopping_text", label: "Text tiếp tục mua sắm", type: "text" },
      { key: "checkout_shipping_title", label: "Tiêu đề thông tin giao hàng", type: "text" },
      { key: "checkout_fullname_placeholder", label: "Placeholder họ tên", type: "text" },
      { key: "checkout_phone_placeholder", label: "Placeholder số điện thoại", type: "text" },
      { key: "checkout_address_placeholder", label: "Placeholder địa chỉ", type: "text" },
      { key: "checkout_notes_placeholder", label: "Placeholder ghi chú", type: "text" },
      { key: "checkout_invoice_toggle_text", label: "Text bật hóa đơn", type: "text" },
      { key: "checkout_invoice_company_placeholder", label: "Placeholder công ty", type: "text" },
      { key: "checkout_invoice_tax_code_placeholder", label: "Placeholder mã số thuế", type: "text" },
      { key: "checkout_invoice_address_placeholder", label: "Placeholder địa chỉ công ty", type: "text" },
      { key: "checkout_invoice_email_placeholder", label: "Placeholder email hóa đơn", type: "text" },
      { key: "checkout_submit_text", label: "Nút xác nhận đặt hàng", type: "text" },
      { key: "checkout_loading_text", label: "Text loading đặt hàng", type: "text" },
      { key: "checkout_summary_title", label: "Tiêu đề đơn hàng", type: "text" },
      { key: "checkout_summary_subtotal_text", label: "Text tạm tính", type: "text" },
      { key: "checkout_summary_shipping_text", label: "Text phí vận chuyển", type: "text" },
      { key: "checkout_summary_shipping_free_text", label: "Text miễn phí ship", type: "text" },
      { key: "checkout_summary_total_text", label: "Text tổng cộng", type: "text" },
    ],
  },
  {
    title: "Blog Detail",
    icon: Type,
    fields: [
      { key: "blog_detail_not_found_title", label: "Tiêu đề bài viết không tồn tại", type: "text" },
      { key: "blog_detail_back_to_blog_text", label: "Text quay lại blog", type: "text" },
      { key: "blog_detail_back_text", label: "Text nút quay lại", type: "text" },
      { key: "blog_detail_author_name", label: "Tên tác giả hiển thị", type: "text" },
      { key: "blog_detail_content_fallback", label: "Nội dung fallback bài viết", type: "textarea" },
    ],
  },
  {
    title: "Footer",
    icon: Type,
    fields: [
      { key: "footer_background_color", label: "Màu nền footer", type: "color" },
      { key: "footer_text_color", label: "Màu chữ footer", type: "color" },
      { key: "footer_heading_color", label: "Màu tiêu đề footer", type: "color" },
      { key: "footer_newsletter_title", label: "Tiêu đề đăng ký nhận tin", type: "text" },
      { key: "footer_newsletter_subtitle", label: "Mô tả đăng ký nhận tin", type: "text" },
      { key: "footer_newsletter_button_text", label: "Text nút đăng ký nhận tin", type: "text" },
      { key: "footer_policy_title", label: "Tiêu đề cột Chính sách", type: "text" },
      { key: "footer_guide_title", label: "Tiêu đề cột Hướng dẫn", type: "text" },
      { key: "footer_connect_title", label: "Tiêu đề cột Kết nối", type: "text" },
      { key: "footer_payment_title", label: "Tiêu đề cột Thanh toán", type: "text" },
      { key: "footer_text", label: "Dòng cuối footer", type: "text" },
    ],
  },
  {
    title: "Danh mục sản phẩm",
    icon: Type,
    fields: [
      { key: "categories", label: "Danh mục sản phẩm (JSON)", type: "textarea" },
    ],
  },
];

const SiteConfigEditor = () => {
  const { config, loading } = useSiteConfig();
  const { toast } = useToast();
  const [draft, setDraft] = useState<SiteConfig>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [jsonConfig, setJsonConfig] = useState("");
  const [importingJson, setImportingJson] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadKey, setActiveUploadKey] = useState<string | null>(null);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const handleChange = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await updateSiteConfigKey(key, draft[key] ?? "");
      toast({ title: "Đã lưu", description: `Cập nhật ${key} thành công` });
    } catch (e: any) {
      toast({ title: "Lỗi", description: e.message, variant: "destructive" });
    }
    setSaving(null);
  };

  const handleSaveAll = async () => {
    setSaving("__all__");
    try {
      const changedKeys = Object.keys(draft).filter((k) => draft[k] !== config[k]);
      for (const key of changedKeys) {
        await updateSiteConfigKey(key, draft[key] ?? "");
      }
      await fetchSiteConfig();
      toast({ title: "Đã lưu tất cả", description: `${changedKeys.length} mục đã cập nhật` });
    } catch (e: any) {
      toast({ title: "Lỗi", description: e.message, variant: "destructive" });
    }
    setSaving(null);
  };

  const handleExportJson = () => {
    const payload = JSON.stringify(draft, null, 2);
    setJsonConfig(payload);
    try {
      navigator.clipboard.writeText(payload);
      toast({ title: "Đã export JSON", description: "Đã copy cấu hình vào clipboard" });
    } catch {
      toast({ title: "Đã export JSON", description: "Copy thủ công từ ô JSON bên dưới" });
    }
  };

  const handleImportJson = async () => {
    setImportingJson(true);
    try {
      const parsed = JSON.parse(jsonConfig || "{}");
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("JSON không hợp lệ");
      }

      const normalized: SiteConfig = {};
      Object.entries(parsed).forEach(([key, value]) => {
        if (typeof value === "string") normalized[key] = value;
        else if (value == null) normalized[key] = "";
        else normalized[key] = String(value);
      });

      await upsertSiteConfigEntries(normalized);
      setDraft((prev) => ({ ...prev, ...normalized }));
      await fetchSiteConfig();
      toast({ title: "Import JSON thành công", description: `Đã cập nhật ${Object.keys(normalized).length} key` });
    } catch (e: any) {
      toast({ title: "Import JSON thất bại", description: e?.message || "Vui lòng kiểm tra JSON", variant: "destructive" });
    } finally {
      setImportingJson(false);
    }
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploading(key);
    try {
      const ext = file.name.split(".").pop();
      const path = `site-config/${key}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;
      handleChange(key, publicUrl);
      await updateSiteConfigKey(key, publicUrl);
      toast({ title: "Upload thành công" });
    } catch (e: any) {
      toast({ title: "Lỗi upload", description: e.message, variant: "destructive" });
    }
    setUploading(null);
  };

  const triggerFileUpload = (key: string) => {
    setActiveUploadKey(key);
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadKey) {
      handleImageUpload(activeUploadKey, file);
    }
    e.target.value = "";
  };

  const hasChanges = Object.keys(draft).some((k) => draft[k] !== config[k]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Đang tải cấu hình...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onFileSelected}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Cấu hình storefront</h2>
          <p className="text-sm text-muted-foreground">Chỉnh sửa sâu theme, text, layout, auth, checkout, blog và đồng bộ toàn site từ database</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportJson}>
            <Download className="h-4 w-4 mr-1" />Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {showPreview ? "Ẩn preview" : "Xem preview"}
          </Button>
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={!hasChanges || saving === "__all__"}
          >
            {saving === "__all__" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Lưu tất cả
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4" style={{ backgroundColor: config.card_color }}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Import / Export cấu hình JSON</h3>
          </div>
          <Button size="sm" onClick={handleImportJson} disabled={importingJson || !jsonConfig.trim()}>
            {importingJson ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            Import JSON
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-2">Dùng để sao lưu hoặc clone giao diện giữa các shop. Export sẽ lấy cấu hình hiện tại trong form.</p>
        <Textarea
          value={jsonConfig}
          onChange={(e) => setJsonConfig(e.target.value)}
          rows={8}
          placeholder="Dán JSON cấu hình vào đây rồi bấm Import JSON"
        />
      </div>

      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Config form */}
        <div className="space-y-6">
          {CONFIG_SECTIONS.map((section) => (
            <div key={section.title} className="border rounded-lg p-5" style={{ backgroundColor: config.card_color }}>
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{section.title}</h3>
              </div>
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      {field.label}
                    </label>
                    {field.type === "color" ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={draft[field.key] || "#000000"}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="h-10 w-14 rounded border cursor-pointer"
                        />
                        <Input
                          value={draft[field.key] || ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSave(field.key)}
                          disabled={saving === field.key || draft[field.key] === config[field.key]}
                        >
                          {saving === field.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        </Button>
                      </div>
                    ) : field.type === "image" ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={draft[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder="URL hình ảnh hoặc upload file"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerFileUpload(field.key)}
                            disabled={uploading === field.key}
                          >
                            {uploading === field.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSave(field.key)}
                            disabled={saving === field.key || draft[field.key] === config[field.key]}
                          >
                            {saving === field.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                          </Button>
                        </div>
                        {draft[field.key] && (
                          <div className="relative w-full max-w-xs rounded-md overflow-hidden border" style={{ backgroundColor: config.muted_color }}>
                            <img
                              src={draft[field.key]}
                              alt={field.label}
                              className="w-full h-auto max-h-32 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : field.type === "textarea" ? (
                      <div className="flex items-start gap-2">
                        <Textarea
                          value={draft[field.key] || ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="flex-1"
                          rows={4}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSave(field.key)}
                          disabled={saving === field.key || draft[field.key] === config[field.key]}
                        >
                          {saving === field.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        </Button>
                      </div>
                    ) : field.type === "boolean" ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={(draft[field.key] || "false").toLowerCase()}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="true">Bật</option>
                          <option value="false">Tắt</option>
                        </select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSave(field.key)}
                          disabled={saving === field.key || draft[field.key] === config[field.key]}
                        >
                          {saving === field.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          value={draft[field.key] || ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSave(field.key)}
                          disabled={saving === field.key || draft[field.key] === config[field.key]}
                        >
                          {saving === field.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Live preview */}
        {showPreview && (
          <div className="sticky top-4 space-y-4">
            <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: config.card_color }}>
              <div className="px-4 py-2 border-b flex items-center justify-between" style={{ backgroundColor: config.muted_color }}>
                <span className="text-sm font-medium text-muted-foreground">Preview Landing Page</span>
                <a href="/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Mở trang chủ
                </a>
              </div>

              {/* Mini header preview */}
              <div className="p-3 border-b" style={{ backgroundColor: config.card_color }}>
                <div className="flex items-center gap-3">
                  {draft.logo_url ? (
                    <img src={draft.logo_url} alt="Logo" className="h-8 object-contain" />
                  ) : (
                    <div className="h-8 w-24 bg-white/20 rounded flex items-center justify-center text-xs text-white">Logo</div>
                  )}
                  <span className="text-white text-sm font-bold">{draft.brand_name || "Thương hiệu"}</span>
                </div>
              </div>

              {/* Hero banner preview */}
              <div className="relative">
                {draft.hero_banner_url ? (
                  <img src={draft.hero_banner_url} alt="Hero" className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 flex flex-col items-center justify-center" style={{ background: `linear-gradient(to right, ${config.primary_color}/20, ${config.secondary_color}/20)` }}>
                    <span className="text-lg font-bold text-foreground">{draft.hero_title || "Tiêu đề"}</span>
                    <span className="text-sm text-muted-foreground">{draft.hero_subtitle || "Phụ đề"}</span>
                  </div>
                )}
              </div>

              {/* Promo banners preview */}
              <div className="p-3 grid grid-cols-2 gap-2">
                {[draft.promo_banner_1_url, draft.promo_banner_2_url].map((url, i) => (
                  <div key={i} className="rounded overflow-hidden border">
                    {url ? (
                      <img src={url} alt={`Promo ${i + 1}`} className="w-full h-20 object-cover" />
                    ) : (
                      <div className="w-full h-20 flex items-center justify-center text-xs text-muted-foreground" style={{ backgroundColor: config.muted_color }}>
                        Banner QC {i + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact info preview */}
              <div className="p-3 border-t text-xs space-y-1" style={{ backgroundColor: config.muted_color }}>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-primary" />
                  <span>{draft.phone || "SĐT"}</span>
                  <span className="mx-1">|</span>
                  <span>Zalo: {draft.zalo_number || "..."}</span>
                </div>
                <div>{draft.email || "email"}</div>
                {draft.address && <div>{draft.address}</div>}
              </div>

              {/* Color swatches */}
              <div className="p-3 border-t flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Màu:</span>
                {[
                  { label: "Chủ đạo", color: draft.primary_color },
                  { label: "Phụ", color: draft.secondary_color },
                  { label: "Nền", color: draft.accent_color },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-1">
                    <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: c.color || config.muted_color }} />
                    <span className="text-xs">{c.label}</span>
                  </div>
                ))}
              </div>

              {/* Footer preview */}
              <div className="p-2 text-center text-xs text-background" style={{ backgroundColor: config.foreground_color }}>
                {draft.footer_text || "Footer text"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteConfigEditor;
