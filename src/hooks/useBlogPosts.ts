import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { BlogPost } from "@/data/products";
import { blogPosts as staticBlogPosts } from "@/data/products";

type SupabaseBlogPost = {
  id: number | string;
  title?: string;
  excerpt?: string;
  image_url?: string;
  slug?: string;
  created_at?: string;
};

const mapDbPostToUi = (p: SupabaseBlogPost): BlogPost => ({
  id: String(p.id),
  title: String(p.title ?? ""),
  excerpt: String(p.excerpt ?? ""),
  image: String(p.image_url ?? ""),
  slug: String(p.slug ?? ""),
  date: p.created_at ? new Date(p.created_at).toLocaleDateString("vi-VN") : " ",
});

export const useBlogPosts = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any;

  return useQuery({
    queryKey: ["blog_posts"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return staticBlogPosts;
      }

      try {
        const { data, error } = await supabaseAny
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!data || !Array.isArray(data) || data.length === 0) return staticBlogPosts;

        return (data as SupabaseBlogPost[]).map(mapDbPostToUi);
      } catch {
        return staticBlogPosts;
      }
    },
  });
};

