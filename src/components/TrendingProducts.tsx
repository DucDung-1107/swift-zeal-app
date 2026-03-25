import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const TrendingProducts = () => {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <section className="container mx-auto py-8">
        <h2 className="text-lg font-medium text-muted-foreground mb-6">Xu hướng tìm kiếm</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  const trendingItems = products?.slice(0, 7) || [];
  if (trendingItems.length === 0) return null;

  return (
    <section className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-muted-foreground">Xu hướng tìm kiếm</h2>
        <a href="/collections/all" className="text-sm text-primary hover:underline font-medium">
          Xem ngay
        </a>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {trendingItems.map((product) => (
          <a
            key={product.id}
            href={`/products/${product.slug}`}
            className="group bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square overflow-hidden bg-muted p-2">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-2 text-center">
              <h3 className="text-sm font-bold text-foreground">{product.name}</h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default TrendingProducts;
