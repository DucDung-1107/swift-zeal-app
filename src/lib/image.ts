const LOVABLE_PLACEHOLDER_PATTERNS = [
  "your app will live here",
  "your+app+will+live+here",
  "your%20app%20will%20live%20here",
  "ask lovable to build it",
  "ask+lovable+to+build+it",
  "ask%20lovable%20to%20build%20it",
];

export const isLovablePlaceholderImage = (url?: string | null) => {
  if (!url) return false;
  const normalized = url.toLowerCase();
  return LOVABLE_PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern));
};

export const resolveImageSrc = (url?: string | null) => {
  if (!url || isLovablePlaceholderImage(url)) {
    return "/placeholder.svg";
  }
  return url;
};
