const PromoBanners = () => {
  return (
    <section className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/blog/chinh-sach-bao-hanh" className="block rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <img
            src="https://theme.hstatic.net/200001032945/1001379709/14/homebanner_1_img.jpg?v=496"
            alt="Chính sách bảo hành"
            className="w-full h-auto"
          />
        </a>
        <a href="/blog/chung-nhan-quoc-te" className="block rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <img
            src="https://theme.hstatic.net/200001032945/1001379709/14/homebanner_2_img.jpg?v=496"
            alt="Chứng nhận đạt chuẩn quốc tế"
            className="w-full h-auto"
          />
        </a>
      </div>
    </section>
  );
};

export default PromoBanners;
