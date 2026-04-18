import { useEffect } from "react";
import { useSiteConfig, DEFAULT_SITE_CONFIG } from "@/hooks/useSiteConfig";

const updateMetaContent = (selector: string, content: string) => {
  const element = document.querySelector<HTMLMetaElement>(selector);
  if (element) {
    element.setAttribute("content", content);
  }
};

const updateFavicon = (href: string) => {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "icon");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

const SiteMetaSync = () => {
  const { config } = useSiteConfig();

  useEffect(() => {
    const title = config.site_title || DEFAULT_SITE_CONFIG.site_title;
    document.title = title;

    const description = config.site_description || DEFAULT_SITE_CONFIG.site_description;
    updateMetaContent("meta[name='description']", description);
    updateMetaContent("meta[property='og:title']", title);
    updateMetaContent("meta[name='twitter:title']", title);
    updateMetaContent("meta[property='og:description']", description);
    updateMetaContent("meta[name='twitter:description']", description);

    const favicon = config.favicon_url || DEFAULT_SITE_CONFIG.favicon_url || "/logo.png";
    updateFavicon(favicon);
  }, [config]);

  return null;
};

export default SiteMetaSync;
