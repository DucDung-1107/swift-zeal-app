import { categories } from "@/data/products";

const CategoryBanner = () => {
  return (
    <section className="container mx-auto py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/collections/${cat.slug}`}
            className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border"
          >
            <div className="aspect-square overflow-hidden bg-primary/10 p-4 flex items-center justify-center">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 text-center">
              <h3 className="font-bold text-sm text-foreground">{cat.name}</h3>
              <span className="text-xs text-muted-foreground">Xem chi tiết</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default CategoryBanner;
