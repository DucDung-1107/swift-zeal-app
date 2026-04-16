import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import heroBannerFallback from "@/assets/banners/hero-banner.jpg";

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { config } = useSiteConfig();

  const slides = [
    {
      image: config.hero_banner_url || heroBannerFallback,
      alt: config.hero_title || "Phúc Vinh Solar",
      link: "/collections/all",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

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
