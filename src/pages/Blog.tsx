import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveImageSrc } from "@/lib/image";

const Blog = () => {
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-10 px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Bài viết</h1>
        <p className="text-sm text-muted-foreground mb-8">Tin tức và kiến thức từ Phúc Vinh Solar</p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[260px] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(posts ?? []).map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={resolveImageSrc(post.image)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm">{post.title}</h2>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.date}</span>
                    <span className="text-primary font-medium">Xem thêm</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Blog;

