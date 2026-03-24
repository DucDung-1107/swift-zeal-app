import { useParams } from "react-router-dom";
import { ShoppingCart, Gift, Truck, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { topProducts, newCollectionProducts } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const allProducts = [...topProducts, ...newCollectionProducts];

const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫";

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = allProducts.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Không tìm thấy sản phẩm</h1>
          <a href="/" className="text-primary hover:underline mt-4 inline-block">Quay lại trang chủ</a>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-card rounded-lg border p-8 flex items-center justify-center">
            <img src={product.image} alt={product.name} className="max-h-96 object-contain" />
          </div>

          {/* Info */}
          <div>
            <span className="text-sm text-primary font-medium">{product.brand}</span>
            <h1 className="text-2xl font-bold text-foreground mt-1">{product.name}</h1>

            <div className="flex items-center gap-3 mt-4">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {product.discount && (
                <span className="bg-destructive text-destructive-foreground text-sm font-bold px-2 py-1 rounded">-{product.discount}%</span>
              )}
            </div>

            {product.hasGift && (
              <div className="flex items-center gap-2 mt-3 text-sm text-primary">
                <Gift className="h-4 w-4" />
                <span>Tặng kèm quà tặng</span>
              </div>
            )}

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><span>Bảo hành 2 năm chính hãng</span></div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /><span>Miễn phí vận chuyển toàn quốc</span></div>
              <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-primary" /><span>Đổi trả trong 7 ngày</span></div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border rounded-md">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-lg hover:bg-muted">−</button>
                <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-lg hover:bg-muted">+</button>
              </div>
              <span className="text-sm text-muted-foreground">{product.inStock ? "Còn hàng" : "Hết hàng"}</span>
            </div>

            <Button onClick={handleAddToCart} className="w-full mt-6" size="lg" disabled={!product.inStock}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
