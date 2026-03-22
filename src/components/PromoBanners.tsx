import promoBanner1 from "@/assets/banners/promo-banner-1.jpg";
import promoBanner2 from "@/assets/banners/promo-banner-2.jpg";

const PromoBanners = () => {
  return (
    <section className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/blog/chinh-sach-bao-hanh" className="block rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <img
            src={promoBanner1}
            alt="Chính sách bảo hành"
            className="w-full h-auto"
          />
        </a>
        <a href="/blog/chung-nhan-quoc-te" className="block rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <img
            src={promoBanner2}
            alt="Chứng nhận đạt chuẩn quốc tế"
            className="w-full h-auto"
          />
        </a>
      </div>
    </section>
  );
};

export default PromoBanners;
