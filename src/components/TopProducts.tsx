import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const TopProducts = () => {
  const { data: products, isLoading } = useProducts();
  const { config } = useSiteConfig();
  const title = config.top_products_title || "TOP SẢN PHẨM BÁN CHẠY";

  if (isLoading) {
    return (
      <section className="container mx-auto py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  const topItems = products?.slice(0, 4) || [];
  if (topItems.length === 0) return null;

  return (
    <section className="container mx-auto py-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {topItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default TopProducts;
