import { useState } from "react";
import DOMPurify from "dompurify";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Minus, Plus, ArrowLeft, Gift, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useProduct } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveImageSrc } from "@/lib/image";

const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫";

const hasDiscount = (product: any) => (product.discount ?? 0) > 0;

const calcBasePrice = (product: any) => {
  // Nếu có giảm giá: dữ liệu cũ có thể dùng `original_price` làm giá gốc.
  // Nếu không giảm: hiển thị theo đúng `product.price`.
  return hasDiscount(product) ? (product.original_price ?? product.price) : product.price;
};

const calcCurrentPrice = (product: any) => {
  const base = calcBasePrice(product);
  const discount = product.discount ?? null;
  if (!discount || discount <= 0) return base;
  return Math.round(base * (1 - discount / 100));
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { data: product, isLoading } = useProduct(slug || "");
  const imageSrc = resolveImageSrc(product?.image_url);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const formatDescriptionHtml = (text?: string | null) => {
    if (!text) return "";
    // Convert common separators and entities to simple HTML
    let out = text.replace(/&nbsp;/g, ' ');
    // Replace long underscore separators with hr
    out = out.replace(/_{6,}/g, '<hr/>');
    // Preserve newlines
    out = out.replace(/\r\n|\r|\n/g, '<br/>');
    return out;
  };

  const handleAddToCart = () => {
    if (!product) return;
    const currentPrice = calcCurrentPrice(product);
    addItem(
      { id: product.id, name: product.name, slug: product.slug, image: imageSrc, price: currentPrice },
      quantity
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-10 w-full" /></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sản phẩm không tồn tại</h1>
          <Button onClick={() => navigate("/")} variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Về trang chủ</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />Quay lại
        </button>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-lg border p-8 flex items-center justify-center">
            <img src={imageSrc} alt={product.name} className="max-w-full max-h-[500px] object-contain" />
          </div>
          <div>
            <span className="text-sm text-accent font-medium">{product.brand}</span>
            <h1 className="text-2xl font-bold text-foreground mt-1">{product.name}</h1>
            {product.sku && <div className="text-sm text-muted-foreground mt-1">Mã sản phẩm: {product.sku}</div>}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {hasDiscount(product) ? (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(calcBasePrice(product))}</span>
                  <span className="text-xl md:text-2xl font-bold text-accent">{formatPrice(calcCurrentPrice(product))}</span>
                  <span className="bg-destructive text-destructive-foreground text-sm font-bold px-2 py-1 rounded">-{product.discount}%</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-accent">{formatPrice(product.price)}</span>
                </>
              )}
            </div>
            {product.has_gift && (
              <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20 flex items-center gap-2">
                <Gift className="h-5 w-5 text-accent" /><span className="text-sm font-medium text-foreground">Quà tặng kèm theo</span>
              </div>
            )}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Số lượng:</span>
              <div className="flex items-center border rounded-md">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-muted"><Minus className="h-4 w-4" /></button>
                <span className="px-4 py-2 border-x font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-muted"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={!product.in_stock}>
                <ShoppingCart className="h-5 w-5 mr-2" />{product.in_stock ? "Thêm vào giỏ hàng" : "Hết hàng"}
              </Button>
            </div>
            <div className="mt-6">
              {product.description && (
                <div className="prose max-w-none text-sm text-foreground">
                  <h3 className="text-base font-medium">Mô tả sản phẩm</h3>
                  <div>
                                    <div
                                      className={!showFullDesc ? 'line-clamp-4 text-sm text-foreground' : 'text-sm text-foreground'}
                                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatDescriptionHtml(product.description)) }}
                                    />
                    <button
                      className="mt-3 text-sm text-primary underline"
                      onClick={() => setShowFullDesc((v) => !v)}
                    >
                      {showFullDesc ? 'Ẩn bớt' : 'Hiển thị tất cả'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground"><Truck className="h-5 w-5 text-primary" />Giao hàng toàn quốc</div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground"><Shield className="h-5 w-5 text-primary" />Bảo hành chính hãng 2 năm</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
