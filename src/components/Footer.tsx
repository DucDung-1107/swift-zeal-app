import { Mail, Phone, MapPin, Facebook, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import logo from "/logo.png";

const Footer = () => {
  const { config } = useSiteConfig();
  const footerBg = config.footer_background_color || config.primary_color;
  const footerText = config.footer_text_color || config.accent_color;
  const footerHeading = config.footer_heading_color || config.primary_foreground_color;

  return (
    <footer style={{ backgroundColor: footerBg, color: footerText }}>
      <div className="border-b" style={{ borderColor: config.secondary_color }}>
        <div className="container mx-auto py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg" style={{ color: footerHeading }}>{config.footer_newsletter_title || "Đăng ký nhận thông tin"}</h3>
              <p className="text-sm" style={{ color: footerText }}>
                {config.footer_newsletter_subtitle || "Nhận tin tức và ưu đãi mới nhất"} {config.brand_name || "Phúc Vinh Solar"}
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Nhập email của bạn"
                className="md:w-72"
                style={{ backgroundColor: config.secondary_color, color: config.accent_color }}
              />
              <Button
                className="font-bold px-6"
                style={{ backgroundColor: config.secondary_color, color: config.accent_color }}
              >
                {config.footer_newsletter_button_text || "ĐĂNG KÝ"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img
              src={config.logo_url || logo}
              alt={config.brand_name || "Phúc Vinh Solar"}
              className="h-10 mb-4"
            />
            <h4 className="font-bold text-sm mb-3">
              CÔNG TY TNHH {(config.brand_name || "PHÚC VINH SOLAR").toUpperCase()}
            </h4>
            <div className="space-y-2 text-sm" style={{ color: footerText }}>
              {config.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: config.secondary_color }} />
                  <span>{config.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" style={{ color: config.secondary_color }} />
                <a
                  href={`tel:${config.phone || "0866121617"}`}
                  className="hover:underline"
                  style={{ color: footerText }}
                >
                  {config.phone || "0866121617"}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" style={{ color: config.secondary_color }} />
                <a
                  href={`mailto:${config.email || "info@phucvinhsolar.vn"}`}
                  className="hover:underline"
                  style={{ color: footerText }}
                >
                  {config.email || "info@phucvinhsolar.vn"}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4" style={{ color: footerHeading }}>{config.footer_policy_title || "CHÍNH SÁCH"}</h4>
            <ul className="space-y-2 text-sm" style={{ color: footerText }}>
              <li><a href="/p/chinh-sach-bao-hanh" className="hover:text-primary transition-colors">Chính sách bảo hành</a></li>
              <li><a href="/p/chinh-sach-doi-tra" className="hover:text-primary transition-colors">Chính sách đổi trả</a></li>
              <li><a href="/p/chinh-sach-van-chuyen" className="hover:text-primary transition-colors">Chính sách vận chuyển</a></li>
              <li><a href="/p/chinh-sach-bao-mat" className="hover:text-primary transition-colors">Chính sách bảo mật</a></li>
              <li><a href="/p/dieu-khoan-dich-vu" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4" style={{ color: footerHeading }}>{config.footer_guide_title || "HƯỚNG DẪN"}</h4>
            <ul className="space-y-2 text-sm" style={{ color: footerText }}>
              <li><a href="/p/huong-dan-mua-hang" className="hover:text-primary transition-colors">Hướng dẫn mua hàng</a></li>
              <li><a href="/p/huong-dan-thanh-toan" className="hover:text-primary transition-colors">Hướng dẫn thanh toán</a></li>
              <li><a href="/p/huong-dan-lap-dat" className="hover:text-primary transition-colors">Hướng dẫn lắp đặt</a></li>
              <li><a href="/p/lien-he" className="hover:text-primary transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4" style={{ color: footerHeading }}>{config.footer_connect_title || "KẾT NỐI VỚI CHÚNG TÔI"}</h4>
            <div className="flex gap-3 mb-4">
              {config.facebook_url && (
                <a
                  href={config.facebook_url}
                  className="h-9 w-9 rounded-full flex items-center justify-center hover:opacity-80"
                  style={{ backgroundColor: config.accent_color }}
                >
                  <Facebook className="h-4 w-4" style={{ color: config.primary_color }} />
                </a>
              )}
              {config.youtube_url && (
                <a
                  href={config.youtube_url}
                  className="h-9 w-9 rounded-full flex items-center justify-center hover:opacity-80"
                  style={{ backgroundColor: config.accent_color }}
                >
                  <Youtube className="h-4 w-4" style={{ color: config.primary_color }} />
                </a>
              )}
            </div>
            <h4 className="font-bold text-sm mb-3" style={{ color: footerHeading }}>{config.footer_payment_title || "PHƯƠNG THỨC THANH TOÁN"}</h4>
            <div className="flex gap-2">
              <div className="h-8 w-12 bg-background/10 rounded flex items-center justify-center text-xs font-bold">VISA</div>
              <div className="h-8 w-12 bg-background/10 rounded flex items-center justify-center text-xs font-bold">MC</div>
              <div className="h-8 w-12 bg-background/10 rounded flex items-center justify-center text-xs font-bold">COD</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: config.secondary_color }}>
        <div className="container mx-auto py-4">
          <p className="text-center text-xs" style={{ color: footerText }}>
            {config.footer_text || "© 2026 Phúc Vinh Solar. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
