import { useState } from "react";
import ProductCard from "./ProductCard";
import { newCollectionProducts } from "@/data/products";

const tabs = [
  { id: "all", label: "ĐÈN NĂNG LƯỢNG MẶT TRỜI" },
  { id: "den-pha", label: "ĐÈN PHA" },
  { id: "den-duong", label: "ĐÈN ĐƯỜNG" },
  { id: "den-lien-the", label: "ĐÈN LIỀN THỂ" },
];

const NewCollection = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredProducts = activeTab === "all"
    ? newCollectionProducts
    : newCollectionProducts.filter((p) => p.category === activeTab);

  return (
    <section className="container mx-auto py-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">BỘ SƯU TẬP MỚI</h2>

      {/* Tabs */}
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

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-6">
        <a
          href="/collections/hot-products"
          className="inline-block px-6 py-2.5 border-2 border-primary text-primary font-medium rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Xem tất cả ĐÈN NĂNG LƯỢNG MẶT TRỜI
        </a>
      </div>
    </section>
  );
};

export default NewCollection;
