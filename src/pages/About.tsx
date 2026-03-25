import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-10 px-4">
        <section className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Về Phúc Vinh Solar</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-3xl mx-auto">
            Phúc Vinh Solar là thương hiệu giải pháp chiếu sáng bằng năng lượng mặt trời dành cho dân dụng và công trình,
            tập trung vào tính hiệu quả, độ bền và trải nghiệm dễ lắp đặt.
          </p>
        </section>

        <section className="bg-card border rounded-lg p-6 md:p-10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">THƯƠNG HIỆU GIẢI PHÁP CHIẾU SÁNG NLMT</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Chúng tôi không chỉ cung cấp sản phẩm, mà còn đồng hành cùng khách hàng bằng các giải pháp chiếu sáng tối ưu:
                chọn đúng công suất, tối ưu chi phí vận hành và đảm bảo tính ổn định theo thời gian.
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-4">
                Với đội ngũ kỹ thuật và quy trình kiểm soát chất lượng, Phúc Vinh Solar nỗ lực tạo ra những thiết bị dễ lắp, dễ sử dụng,
                phù hợp nhiều nhu cầu thực tế.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <a href="/collections/all">Khám phá sản phẩm</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/blog">Xem bài viết mới nhất</a>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border bg-background p-4">
                <div className="text-sm font-bold text-foreground mb-1">Tầm nhìn</div>
                <div className="text-sm text-muted-foreground">Tạo ra tương lai xanh, nơi mỗi công trình đều được chiếu sáng hiệu quả bằng năng lượng sạch.</div>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <div className="text-sm font-bold text-foreground mb-1">Sứ mệnh</div>
                <div className="text-sm text-muted-foreground">Mang ánh sáng đến mọi nhà thông qua các giải pháp chất lượng cao, chi phí hợp lý và thân thiện môi trường.</div>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <div className="text-sm font-bold text-foreground mb-1">Giá trị cốt lõi</div>
                <div className="text-sm text-muted-foreground">Hiệu quả - Trách nhiệm - Biết ơn. Luôn đặt uy tín và lợi ích dài hạn của khách hàng lên trước.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-6">Năng lực & cam kết</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border rounded-lg p-5">
              <h3 className="font-bold text-foreground mb-2">Quy mô sản xuất</h3>
              <p className="text-sm text-muted-foreground">
                Đầu tư dây chuyền và tối ưu quy trình để đảm bảo chất lượng ổn định, đáp ứng nhu cầu số lượng theo mùa vụ và dự án.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-5">
              <h3 className="font-bold text-foreground mb-2">Đội ngũ kỹ thuật</h3>
              <p className="text-sm text-muted-foreground">
                Hỗ trợ tư vấn giải pháp, tính toán công suất và hướng dẫn lắp đặt để khách hàng triển khai đúng kỹ thuật ngay từ đầu.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-5">
              <h3 className="font-bold text-foreground mb-2">Chứng nhận & tiêu chuẩn</h3>
              <p className="text-sm text-muted-foreground">
                Hướng tới các tiêu chuẩn về chất lượng và an toàn trong sản xuất, giúp khách hàng yên tâm khi lựa chọn.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-card border rounded-lg p-6 md:p-10 mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">Logo & ý nghĩa</h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-4xl">
            Logo của Phúc Vinh Solar thể hiện tinh thần “tập trung vào nguồn năng lượng sạch” và cam kết đồng hành bền bỉ với khách hàng.
            Màu sắc và hình khối được thiết kế để gợi cảm giác tin cậy, hướng tới một tương lai bền vững.
          </p>
        </section>

        <section className="bg-card border rounded-lg p-6 md:p-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">Đăng ký nhận thông tin</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Nhận tư vấn dự án và cập nhật sản phẩm/kiến thức mới nhất. (Chưa gửi về hệ thống thực tế trong demo.)
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <Input placeholder="Nhập email của bạn" />
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">Đăng ký</Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

