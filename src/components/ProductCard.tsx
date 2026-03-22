import { ShoppingCart, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN").format(price) + "₫";
};

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="group bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow relative">
      {/* Discount badge */}
      {product.discount && (
        <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded z-10">
          -{product.discount}%
        </span>
      )}

      {/* Gift icon */}
      {product.hasGift && (
        <span className="absolute top-2 right-2 z-10">
          <Gift className="h-5 w-5 text-primary" />
        </span>
      )}

      {/* Image */}
      <a href={`/products/${product.slug}`} className="block aspect-square overflow-hidden bg-muted p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </a>

      {/* Info */}
      <div className="p-3">
        <span className="text-xs text-primary font-medium">{product.brand}</span>
        <a href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground mt-1 line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </a>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-primary font-bold text-base">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-muted-foreground line-through text-xs">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <Button
          className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
          size="sm"
          disabled={!product.inStock}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          {product.inStock ? "Thêm vào giỏ" : "Hết hàng"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
