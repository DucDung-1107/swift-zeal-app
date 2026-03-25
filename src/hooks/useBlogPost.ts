import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BlogPost } from "@/data/products";
import { blogPosts as staticBlogPosts } from "@/data/products";

const mapDbPostToUi = (p: any): BlogPost => ({
  id: String(p.id),
  title: String(p.title ?? ""),
  excerpt: String(p.excerpt ?? ""),
  image: String(p.image_url ?? ""),
  slug: String(p.slug ?? ""),
  date: p.created_at ? new Date(p.created_at).toLocaleDateString("vi-VN") : " ",
});

export const useBlogPost = (slug: string) => {
  const supabaseAny = supabase as any;

  return useQuery({
    queryKey: ["blog_posts", slug],
    enabled: !!slug,
    queryFn: async (): Promise<BlogPost | null> => {
      try {
        const { data, error } = await supabaseAny.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
        if (error) throw error;
        if (!data) return null;
        return mapDbPostToUi(data);
      } catch {
        return staticBlogPosts.find((p) => p.slug === slug) ?? null;
      }
    },
  });
};

