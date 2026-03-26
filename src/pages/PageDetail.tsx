import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PageDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading } = useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; title: string; slug: string; content: string } | null;
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-12 px-4 min-h-[60vh]">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : page ? (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-6">{page.title}</h1>
            {page.content ? (
              <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap">{page.content}</div>
            ) : (
              <p className="text-muted-foreground">Nội dung đang được cập nhật...</p>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy trang</h1>
            <p className="text-muted-foreground">Trang bạn tìm không tồn tại.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PageDetail;
