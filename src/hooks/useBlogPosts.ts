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

export const useBlogPosts = () => {
  const supabaseAny = supabase as any;

  return useQuery({
    queryKey: ["blog_posts"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      try {
        const { data, error } = await supabaseAny
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!data || !Array.isArray(data) || data.length === 0) return staticBlogPosts;

        return (data as any[]).map(mapDbPostToUi);
      } catch {
        return staticBlogPosts;
      }
    },
  });
};

