import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const NewCollection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { data: products, isLoading } = useProducts(activeTab);
  const [categories, setCategories] = useState([{ id: "all", name: "TẤT CẢ" }]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("id, name, slug").order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }
      setCategories([{ id: "all", name: "TẤT CẢ" }, ...(data || [])]);
    };

    fetchCategories();
  }, []);

  return (
    <section className="container mx-auto py-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">BỘ SƯU TẬP MỚI</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.name}
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
