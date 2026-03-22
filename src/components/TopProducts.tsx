import ProductCard from "./ProductCard";
import { topProducts } from "@/data/products";

const TopProducts = () => {
  return (
    <section className="container mx-auto py-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        TOP SẢN PHẨM BÁN CHẠY
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {topProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default TopProducts;
