import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

const NewCollection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { data: products, isLoading } = useProducts(activeTab);
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: "all", name: "TẤT CẢ", slug: "all", category: "all" },
  ]);
  const { config } = useSiteConfig();
  const title = config.new_collection_title || "BỘ SƯU TẬP MỚI";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, category")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }

        if (!data || data.length === 0) {
          return;
        }

        setCategories([{ id: "all", name: "TẤT CẢ", slug: "all", category: "all" }, ...(data as CategoryItem[])]);
      } catch (err) {
        console.error("Unexpected error while fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="container mx-auto py-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.category)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={
              activeTab === cat.category
                ? {
                    backgroundColor: config.primary_color,
                    color: config.primary_foreground_color,
                  }
                : {
                    backgroundColor: config.muted_color,
                    color: config.muted_foreground_color,
                  }
            }
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
