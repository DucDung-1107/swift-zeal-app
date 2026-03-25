import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Collections = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const selected = useMemo(() => {
    if (!slug || slug === "all") return null;
    return categories.find((c) => c.slug === slug) ?? null;
  }, [slug]);

  const normalizedCategory = slug === "all" || !selected ? undefined : selected.category;
  const pageTitle = selected ? selected.name : "Tất Cả Sản Phẩm";

  const { data: products, isLoading, error } = useProducts(normalizedCategory);

  useEffect(() => {
    if (!error) return;
    toast({ title: "Không thể tải sản phẩm", description: "Vui lòng thử lại sau.", variant: "destructive" });
  }, [error, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-8 px-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm font-medium">Danh mục</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{pageTitle}</h1>
            {products && !isLoading && (
              <p className="text-sm text-muted-foreground mt-2">{products.length} sản phẩm</p>
            )}
          </div>

          <div className="min-w-[220px]">
            <label className="text-sm text-muted-foreground">Chọn danh mục</label>
            <select
              value={slug ?? "all"}
              onChange={(e) => navigate(`/collections/${e.target.value}`)}
              className="mt-2 w-full border rounded-md px-3 py-2 bg-background text-foreground"
            >
              <option value="all">Tất Cả Sản Phẩm</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/")} className="w-full">
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">Chưa có sản phẩm nào trong danh mục này.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Collections;

