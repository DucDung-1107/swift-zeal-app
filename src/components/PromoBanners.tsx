import { useSiteConfig } from "@/hooks/useSiteConfig";
import promoBanner1Fallback from "@/assets/banners/promo-banner-1.jpg";
import promoBanner2Fallback from "@/assets/banners/promo-banner-2.jpg";

const PromoBanners = () => {
  const { config } = useSiteConfig();

  const banners = [
    {
      image: config.promo_banner_1_url || promoBanner1Fallback,
      link: config.promo_banner_1_link || "/blog/chinh-sach-bao-hanh",
      alt: "Banner quảng cáo 1",
    },
    {
      image: config.promo_banner_2_url || promoBanner2Fallback,
      link: config.promo_banner_2_link || "/blog/chung-nhan-quoc-te",
      alt: "Banner quảng cáo 2",
    },
  ];

  return (
    <section className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner, i) => (
          <a key={i} href={banner.link} className="block rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img src={banner.image} alt={banner.alt} className="w-full h-auto" />
          </a>
        ))}
      </div>
    </section>
  );
};

export default PromoBanners;
