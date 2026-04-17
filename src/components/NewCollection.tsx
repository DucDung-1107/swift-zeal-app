import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const NewCollection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { data: products, isLoading } = useProducts(activeTab);
  const [categories, setCategories] = useState([{ id: "all", name: "TẤT CẢ" }]);
  const { config } = useSiteConfig(); // Import dynamic config

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching categories:", error);
          alert("Không thể tải danh mục. Vui lòng thử lại sau.");
          return;
        }

        if (!data || data.length === 0) {
          console.warn("No categories found in the database.");
          alert("Không có danh mục nào được tìm thấy.");
          return;
        }

        setCategories([{ id: "all", name: "TẤT CẢ" }, ...data]);
      } catch (err) {
        console.error("Unexpected error while fetching categories:", err);
        alert("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
      }
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
                ? `bg-[${config.primary_color}] text-[${config.primary_foreground_color}]`
                : `bg-[${config.muted_color}] text-[${config.muted_foreground_color}] hover:bg-[${config.muted_color}/80]`
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
