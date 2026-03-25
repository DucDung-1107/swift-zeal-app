import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPost } from "@/hooks/useBlogPost";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading } = useBlogPost(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-10 px-4">
          <Skeleton className="h-[320px] rounded-lg" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Bài viết không tồn tại</h1>
          <Button variant="outline" onClick={() => navigate("/blog")}>
            Quay lại trang Blog
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-10 px-4">
        <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-primary mb-6">
          Quay lại
        </button>

        <article className="max-w-3xl mx-auto">
          <img src={post.image} alt={post.title} className="w-full h-[320px] object-cover rounded-lg border" />
          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">{post.date}</span>
            <span className="text-xs text-primary font-medium">Phúc Vinh Solar</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-3 leading-tight">{post.title}</h1>
          <p className="text-sm text-muted-foreground mt-4">{post.excerpt}</p>

          <div className="mt-8 bg-card border rounded-lg p-6">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              Nội dung chi tiết đang được cập nhật. Bạn có thể liên hệ để nhận tư vấn thêm ngay hôm nay.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;

