import { ShoppingCart, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import type { DbProduct } from "@/hooks/useProducts";
import { resolveImageSrc } from "@/lib/image";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN").format(price) + "₫";
};

const hasDiscount = (product: DbProduct) => (product.discount ?? 0) > 0;

const calcBasePrice = (product: DbProduct) => {
  // Nếu có giảm giá: dữ liệu cũ có thể dùng `original_price` làm giá gốc.
  // Nếu không giảm: hiển thị đúng `product.price` theo yêu cầu.
  return hasDiscount(product) ? (product.original_price ?? product.price) : product.price;
};

const calcCurrentPrice = (product: DbProduct) => {
  const base = calcBasePrice(product);
  const discount = product.discount ?? null;
  if (!discount || discount <= 0) return base;
  return Math.round(base * (1 - discount / 100));
};

interface ProductCardProps {
  product: DbProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentPrice = calcCurrentPrice(product);
    const imageSrc = resolveImageSrc(product.image_url);
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: imageSrc,
      price: currentPrice,
    });
  };

  const basePrice = calcBasePrice(product);
  const currentPrice = calcCurrentPrice(product);
  const showDiscount = hasDiscount(product);
  const imageSrc = resolveImageSrc(product.image_url);

  return (
    <div className="group bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow relative">
      {showDiscount && (
        <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded z-10">
          -{product.discount}%
        </span>
      )}
      {product.has_gift && (
        <span className="absolute top-2 right-2 z-10">
          <Gift className="h-5 w-5 text-accent" />
        </span>
      )}
      <a href={`/products/${product.slug}`} className="block aspect-square overflow-hidden bg-muted p-4">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </a>
      <div className="p-3">
        <span className="text-xs text-accent font-medium">{product.brand}</span>
        <a href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground mt-1 line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </a>
        <div className="flex items-center gap-2 mt-2">
          {showDiscount ? (
            <>
              <span className="text-muted-foreground line-through text-xs">{formatPrice(basePrice)}</span>
              <span className="text-accent font-bold text-base">{formatPrice(currentPrice)}</span>
            </>
          ) : (
            <span className="text-accent font-bold text-base">{formatPrice(basePrice)}</span>
          )}
        </div>
        <Button
          className="w-full mt-3 text-sm"
          size="sm"
          disabled={!product.in_stock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          {product.in_stock ? "Thêm vào giỏ" : "Hết hàng"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
