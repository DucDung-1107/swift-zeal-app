import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BlogPost } from "@/data/products";

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
  return useQuery({
    queryKey: ["blog_posts"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as SupabaseBlogPost[] | null)?.map(mapDbPostToUi) ?? [];
    },
  });
};

