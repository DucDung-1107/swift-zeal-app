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
  secondary_color: "#E6C35A",
  accent_color: "#EDEDED",
  hero_banner_url: "",
  hero_title: "Đèn Năng Lượng Mặt Trời Chính Hãng",
  hero_subtitle: "Giải pháp chiếu sáng thông minh, tiết kiệm năng lượng",
  promo_banner_1_url: "",
  promo_banner_1_link: "",
  promo_banner_2_url: "",
  promo_banner_2_link: "",
  footer_text: "© 2026 Phúc Vinh Solar. All rights reserved.",
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
