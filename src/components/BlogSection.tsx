import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveImageSrc } from "@/lib/image";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const BlogSection = () => {
  const { data: posts, isLoading } = useBlogPosts();
  const { config } = useSiteConfig();
  const sectionTitle = config.blog_section_title || "Bài Viết Mới Nhất";
  const sectionCta = config.blog_section_cta_text || "Xem tất cả";
  const itemCta = config.blog_item_cta_text || "Xem thêm";

  return (
    <section className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{sectionTitle}</h2>
        <a href="/blog" className="text-sm text-primary hover:underline font-medium">
          {sectionCta}
        </a>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[320px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(posts ?? []).slice(0, 6).map((post) => (
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
                <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm">
                  {post.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                  <span className="text-xs text-primary font-medium">{itemCta}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

export default BlogSection;
