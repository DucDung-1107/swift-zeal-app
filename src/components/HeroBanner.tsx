import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroBanner from "@/assets/banners/hero-banner.jpg";

const slides = [
  {
    image: heroBanner,
    alt: "Phúc Vinh Solar - Giải pháp chiếu sáng năng lượng mặt trời",
    link: "/collections/all",
  },
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative">
        {slides.map((slide, index) => (
          <a
            key={index}
            href={slide.link}
            className={`block w-full transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-auto object-cover"
            />
          </a>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full p-2 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full p-2 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
