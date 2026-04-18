import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseConfigBoolean, useSiteConfig } from "@/hooks/useSiteConfig";
import heroBannerFallback from "@/assets/banners/hero-banner.jpg";

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { config } = useSiteConfig();
  const showOverlay = parseConfigBoolean(config.hero_overlay_enabled, true);

  const slides = [
    {
      image: config.hero_banner_url || heroBannerFallback,
      alt: config.hero_title || "Phúc Vinh Solar",
      link: config.hero_button_link || "/collections/all",
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
          <div
            key={index}
            className={`block w-full transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}
          >
            <img src={slide.image} alt={slide.alt} className="w-full h-auto object-cover" />
            {showOverlay && (
              <div className="absolute inset-0 flex items-center bg-black/25">
                <div className="container mx-auto px-4 md:px-8">
                  <div className="max-w-2xl space-y-3">
                    <h1 className="text-2xl md:text-4xl font-bold" style={{ color: config.hero_title_color || "#FFFFFF" }}>
                      {config.hero_title || "Đèn Năng Lượng Mặt Trời Chính Hãng"}
                    </h1>
                    <p className="text-sm md:text-lg" style={{ color: config.hero_subtitle_color || "#FFFFFF" }}>
                      {config.hero_subtitle || "Giải pháp chiếu sáng thông minh, tiết kiệm năng lượng"}
                    </p>
                    <a
                      href={slide.link}
                      className="inline-flex rounded-md px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: config.primary_color,
                        color: config.primary_foreground_color,
                      }}
                    >
                      {config.hero_button_text || "Mua ngay"}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
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
