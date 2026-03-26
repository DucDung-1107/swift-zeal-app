import { Mail, Phone, MapPin, Facebook, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "/logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="border-b border-muted-foreground/20">
        <div className="container mx-auto py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Đăng ký nhận thông tin</h3>
              <p className="text-sm text-muted-foreground">Nhận tin tức và ưu đãi mới nhất từ Phúc Vinh Solar</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input placeholder="Nhập email của bạn" className="bg-background/10 border-muted-foreground/30 text-background placeholder:text-muted-foreground/50 md:w-72" />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6">ĐĂNG KÝ</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img src={logo} alt="Phúc Vinh Solar" className="h-10 mb-4" />
            <h4 className="font-bold text-sm mb-3">CÔNG TY TNHH PHÚC VINH SOLAR</h4>
            <div className="space-y-2 text-sm text-background/70">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>Số 48 Đê Yêm, Phường Phù Vân, Tỉnh Ninh Bình, Việt Nam</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                <a href="tel:0911915398" className="hover:text-primary transition-colors">0911 915 398</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                <a href="mailto:info@phucvinhsolar.vn" className="hover:text-primary transition-colors">info@phucvinhsolar.vn</a>
              </div>
            </div>
            <div className="mt-3 text-xs text-background/50">
              <p>MST: 0700912957</p>
              <p>Người đại diện: NGUYỄN THẾ HIỂN</p>
              <p>Tên quốc tế: PHUC VINH SOLAR COMPANY LIMITED</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">CHÍNH SÁCH</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="/chinh-sach-bao-hanh" className="hover:text-primary transition-colors">Chính sách bảo hành</a></li>
              <li><a href="/chinh-sach-doi-tra" className="hover:text-primary transition-colors">Chính sách đổi trả</a></li>
              <li><a href="/chinh-sach-van-chuyen" className="hover:text-primary transition-colors">Chính sách vận chuyển</a></li>
              <li><a href="/chinh-sach-bao-mat" className="hover:text-primary transition-colors">Chính sách bảo mật</a></li>
              <li><a href="/dieu-khoan-dich-vu" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">HƯỚNG DẪN</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="/huong-dan-mua-hang" className="hover:text-primary transition-colors">Hướng dẫn mua hàng</a></li>
              <li><a href="/huong-dan-thanh-toan" className="hover:text-primary transition-colors">Hướng dẫn thanh toán</a></li>
              <li><a href="/huong-dan-lap-dat" className="hover:text-primary transition-colors">Hướng dẫn lắp đặt</a></li>
              <li><a href="/lien-he" className="hover:text-primary transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">KẾT NỐI VỚI CHÚNG TÔI</h4>
            <div className="flex gap-3 mb-4">
              <a href="https://facebook.com" className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://youtube.com" className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
            <h4 className="font-bold text-sm mb-3">PHƯƠNG THỨC THANH TOÁN</h4>
            <div className="flex gap-2">
              <div className="h-8 w-12 bg-background/10 rounded flex items-center justify-center text-xs font-bold">VISA</div>
              <div className="h-8 w-12 bg-background/10 rounded flex items-center justify-center text-xs font-bold">MC</div>
              <div className="h-8 w-12 bg-background/10 rounded flex items-center justify-center text-xs font-bold">COD</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-muted-foreground/20">
        <div className="container mx-auto py-4">
          <p className="text-center text-xs text-background/50">© 2026 Phúc Vinh Solar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
