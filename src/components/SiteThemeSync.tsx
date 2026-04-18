import { useEffect } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const hexToHsl = (hex: string) => {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{3,8}$/.test(normalized)) return null;

  const full = normalized.length === 3
    ? normalized.split("").map((c) => `${c}${c}`).join("")
    : normalized.slice(0, 6);

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const setVarFromHex = (root: HTMLElement, key: string, value: string | undefined, fallback: string) => {
  const hsl = hexToHsl(value || "") || hexToHsl(fallback);
  if (hsl) root.style.setProperty(key, hsl);
};

const SiteThemeSync = () => {
  const { config } = useSiteConfig();

  useEffect(() => {
    const root = document.documentElement;

    setVarFromHex(root, "--background", config.background_color, "#FFFFFF");
    setVarFromHex(root, "--foreground", config.foreground_color, "#111827");
    setVarFromHex(root, "--card", config.card_color, "#FFFFFF");
    setVarFromHex(root, "--card-foreground", config.foreground_color, "#111827");
    setVarFromHex(root, "--primary", config.primary_color, "#0B4F3A");
    setVarFromHex(root, "--primary-foreground", config.primary_foreground_color, "#FFFFFF");
    setVarFromHex(root, "--secondary", config.secondary_color, "#E6C35A");
    setVarFromHex(root, "--secondary-foreground", config.foreground_color, "#111827");
    setVarFromHex(root, "--muted", config.muted_color, "#F3F4F6");
    setVarFromHex(root, "--muted-foreground", config.muted_foreground_color, "#111827");
    setVarFromHex(root, "--accent", config.accent_color, "#EDEDED");
    setVarFromHex(root, "--accent-foreground", config.foreground_color, "#111827");
    setVarFromHex(root, "--destructive", config.destructive_color, "#EF4444");
    setVarFromHex(root, "--destructive-foreground", config.destructive_foreground_color, "#FFFFFF");
    setVarFromHex(root, "--border", config.muted_color, "#E5E7EB");
    setVarFromHex(root, "--input", config.muted_color, "#E5E7EB");
    setVarFromHex(root, "--ring", config.primary_color, "#0B4F3A");
  }, [config]);

  return null;
};

export default SiteThemeSync;
