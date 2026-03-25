import { useState } from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const tabs = [
  { id: "all", label: "TẤT CẢ" },
  { id: "den-pha", label: "ĐÈN PHA" },
  { id: "den-duong", label: "ĐÈN ĐƯỜNG" },
  { id: "den-lien-the", label: "ĐÈN LIỀN THỂ" },
  { id: "den-khan-cap", label: "ĐÈN KHẨN CẤP" },
];

const NewCollection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { data: products, isLoading } = useProducts(activeTab);

  return (
    <section className="container mx-auto py-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">BỘ SƯU TẬP MỚI</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default NewCollection;
