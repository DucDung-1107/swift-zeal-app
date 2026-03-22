import { trendingProducts } from "@/data/products";

const TrendingProducts = () => {
  return (
    <section className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-muted-foreground">Xu hướng tìm kiếm</h2>
        <a href="/collections/all" className="text-sm text-primary hover:underline font-medium">
          Xem ngay
        </a>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {trendingProducts.map((product) => (
          <a
            key={product.id}
            href={`/products/${product.slug}`}
            className="group bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square overflow-hidden bg-muted p-2">
              <img
                src={product.image}
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
