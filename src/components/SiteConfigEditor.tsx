import { useState, useEffect, useRef } from "react";
import { useSiteConfig, updateSiteConfigKey, fetchSiteConfig, type SiteConfig } from "@/hooks/useSiteConfig";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, Eye, Palette, Phone, Image, Type, Loader2, ExternalLink } from "lucide-react";

const CONFIG_SECTIONS = [
  {
    title: "Thương hiệu",
    icon: Type,
    fields: [
      { key: "brand_name", label: "Tên thương hiệu", type: "text" },
      { key: "logo_url", label: "Logo (URL hoặc upload)", type: "image" },
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
    title: "Bảng màu",
    icon: Palette,
    fields: [
      { key: "primary_color", label: "Màu chủ đạo", type: "color" },
      { key: "secondary_color", label: "Màu phụ", type: "color" },
      { key: "accent_color", label: "Màu nền", type: "color" },
    ],
  },
  {
    title: "Footer",
    icon: Type,
    fields: [
      { key: "footer_text", label: "Dòng cuối footer", type: "text" },
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
          <h2 className="text-xl font-bold text-foreground">Cấu hình trang chủ</h2>
          <p className="text-sm text-muted-foreground">Chỉnh sửa nội dung, hình ảnh, màu sắc hiển thị trên landing page</p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Config form */}
        <div className="space-y-6">
          {CONFIG_SECTIONS.map((section) => (
            <div key={section.title} className="bg-card border rounded-lg p-5">
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
                          <div className="relative w-full max-w-xs rounded-md overflow-hidden border">
                            <img
                              src={draft[field.key]}
                              alt={field.label}
                              className="w-full h-auto max-h-32 object-contain bg-muted"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
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
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Preview Landing Page</span>
                <a href="/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Mở trang chủ
                </a>
              </div>

              {/* Mini header preview */}
              <div className="p-3 border-b" style={{ backgroundColor: draft.primary_color || "#0B4F3A" }}>
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
                  <div className="w-full h-40 bg-gradient-to-r from-primary/20 to-secondary/20 flex flex-col items-center justify-center">
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
                      <div className="w-full h-20 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        Banner QC {i + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact info preview */}
              <div className="p-3 border-t bg-muted/50 text-xs space-y-1">
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
                    <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: c.color || "#ccc" }} />
                    <span className="text-xs">{c.label}</span>
                  </div>
                ))}
              </div>

              {/* Footer preview */}
              <div className="p-2 text-center text-xs bg-foreground text-background">
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
