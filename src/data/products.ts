import solarCable from "@/assets/products/solar-cable-5m.png";
import solarFloodlight from "@/assets/products/solar-floodlight-1.png";
import solarIntegrated from "@/assets/products/solar-integrated-1.png";
import solarStreetlight1 from "@/assets/products/solar-streetlight-1.png";
import solarStreetlight2 from "@/assets/products/solar-streetlight-2.png";
import solarStreetlight3 from "@/assets/products/solar-streetlight-3.png";
import solarEmergency from "@/assets/products/solar-emergency-1.png";
import catFloodlight from "@/assets/categories/cat-floodlight.jpg";
import catStreetlight from "@/assets/categories/cat-streetlight.jpg";
import catIntegrated from "@/assets/categories/cat-integrated.jpg";
import catEmergency from "@/assets/categories/cat-emergency.jpg";
import trending1 from "@/assets/trending/trending-1.jpg";
import trending2 from "@/assets/trending/trending-2.jpg";
import trending3 from "@/assets/trending/trending-3.jpg";
import trending4 from "@/assets/trending/trending-4.jpg";
import trending5 from "@/assets/trending/trending-5.jpg";
import trending6 from "@/assets/trending/trending-6.jpg";
import trending7 from "@/assets/trending/trending-7.jpg";
import blog1 from "@/assets/blog/blog-1.jpg";
import blog2 from "@/assets/blog/blog-2.jpg";
import blog3 from "@/assets/blog/blog-3.jpg";
import blog4 from "@/assets/blog/blog-4.jpg";
import blog5 from "@/assets/blog/blog-5.jpg";
import blog6 from "@/assets/blog/blog-6.jpg";

export interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  hoverImage?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  brand: string;
  category: string;
  inStock: boolean;
  hasGift?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  slug: string;
  // `category` là giá trị lưu trong cột `products.category` để lọc dữ liệu.
  category: string;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "ĐÈN PHA NLMT",
    image: catFloodlight,
    slug: "den-pha-nang-luong-mat-troi",
    category: "den-pha",
  },
  {
    id: "2",
    name: "ĐÈN ĐƯỜNG NLMT",
    image: catStreetlight,
    slug: "den-duong-nang-luong-mat-troi",
    category: "den-duong",
  },
  {
    id: "3",
    name: "ĐÈN NLMT LIỀN THỂ",
    image: catIntegrated,
    slug: "den-nang-luong-mat-troi-lien-the",
    category: "den-lien-the",
  },
  {
    id: "4",
    name: "ĐÈN NLMT KHẨN CẤP",
    image: catEmergency,
    slug: "den-khan-cap-nang-luong-mat-troi",
    category: "den-khan-cap",
  },
];

export const topProducts: Product[] = [
  {
    id: "1",
    name: "DÂY NỐI ĐÈN PHA DÀI 5M",
    slug: "day-noi-dai-5m",
    image: solarCable,
    price: 100000,
    brand: "PV SOLAR",
    category: "phu-kien",
    inStock: true,
    hasGift: true,
  },
  {
    id: "2",
    name: "DÂY NỐI ĐÈN PHA DÀI 5M PV619-500",
    slug: "day-noi-den-pha-dai-5m-pv619",
    image: solarCable,
    price: 220000,
    brand: "PV SOLAR",
    category: "phu-kien",
    inStock: true,
    hasGift: true,
  },
  {
    id: "3",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI LIỀN THỂ",
    slug: "den-nang-luong-mat-troi-lien-the-pv712",
    image: solarIntegrated,
    price: 580000,
    originalPrice: 880000,
    discount: 34,
    brand: "PV SOLAR",
    category: "den-lien-the",
    inStock: true,
    hasGift: true,
  },
  {
    id: "4",
    name: "ĐÈN PHA NĂNG LƯỢNG MẶT TRỜI",
    slug: "den-pha-nang-luong-mat-troi",
    image: solarFloodlight,
    price: 780000,
    originalPrice: 1050000,
    discount: 26,
    brand: "PV SOLAR",
    category: "den-pha",
    inStock: true,
    hasGift: true,
  },
];

export const trendingProducts = [
  {
    id: "t1",
    name: "PV616",
    image: trending1,
    slug: "den-pha-nang-luong-mat-troi-pv616",
  },
  {
    id: "t2",
    name: "PV619",
    image: trending2,
    slug: "den-pha-nang-luong-mat-troi-pv619",
  },
  {
    id: "t3",
    name: "PV818",
    image: trending3,
    slug: "bo-den-duong-led-nang-luong-mat-troi-pv818",
  },
  {
    id: "t4",
    name: "PV716",
    image: trending4,
    slug: "bo-den-duong-led-nang-luong-mat-troi-pv716",
  },
  {
    id: "t5",
    name: "PV711",
    image: trending5,
    slug: "den-duong-led-lien-the-nang-luong-mat-troi-pv711",
  },
  {
    id: "t6",
    name: "PV717",
    image: trending6,
    slug: "den-duong-led-lien-the-nang-luong-mat-troi-pv717",
  },
  {
    id: "t7",
    name: "PV611",
    image: trending7,
    slug: "den-pha-nang-luong-mat-troi-pv611",
  },
];

export const newCollectionProducts: Product[] = [
  {
    id: "nc1",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI",
    slug: "pv718-600",
    image: solarStreetlight3,
    price: 3800000,
    brand: "PV SOLAR",
    category: "den-duong",
    inStock: true,
    hasGift: true,
  },
  {
    id: "nc2",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI",
    slug: "bo-den-duong-led-nang-luong-mat-troi-pv818",
    image: solarStreetlight1,
    price: 1950000,
    brand: "PV SOLAR",
    category: "den-duong",
    inStock: true,
    hasGift: true,
  },
  {
    id: "nc3",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI",
    slug: "bo-den-duong-led-nang-luong-mat-troi-pv716",
    image: solarStreetlight2,
    price: 1850000,
    brand: "PV SOLAR",
    category: "den-duong",
    inStock: true,
    hasGift: true,
  },
  {
    id: "nc4",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI LIỀN THỂ",
    slug: "den-duong-nang-luong-mat-troi-lien-the",
    image: solarIntegrated,
    price: 4330000,
    brand: "PV SOLAR",
    category: "den-lien-the",
    inStock: true,
    hasGift: true,
  },
  {
    id: "nc5",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI LIỀN THỂ",
    slug: "den-nang-luong-mat-troi-lien-the-pv712",
    image: solarIntegrated,
    price: 580000,
    originalPrice: 880000,
    discount: 34,
    brand: "PV SOLAR",
    category: "den-lien-the",
    inStock: true,
    hasGift: true,
  },
  {
    id: "nc6",
    name: "ĐÈN NĂNG LƯỢNG MẶT TRỜI KHẨN CẤP",
    slug: "den-nang-luong-mat-troi-cam-tay-pv518",
    image: solarEmergency,
    price: 730000,
    brand: "PV SOLAR",
    category: "den-khan-cap",
    inStock: true,
    hasGift: true,
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    title: "Đèn Năng Lượng Mặt Trời PV818 – Giải Pháp Chiếu Sáng Mạnh Tiết Kiệm 100% Điện",
    excerpt: "Đèn năng lượng mặt trời PV818 là dòng đèn NLMT có tấm pin rời, được ưa chuộng nhờ hiệu suất chiếu sáng mạnh...",
    image: blog1,
    date: "19 Tháng 03, 2026",
    slug: "den-nang-luong-mat-troi-pv818-giai-phap-chieu-sang-tiet-kiem",
  },
  {
    id: "b2",
    title: "Chính Sách Đại Lý Đèn Năng Lượng Mặt Trời Phúc Vinh Solar Mới Nhất 2026",
    excerpt: "Thị trường đèn năng lượng mặt trời tại Việt Nam đang phát triển mạnh nhờ nhu cầu tiết kiệm điện...",
    image: blog2,
    date: "19 Tháng 03, 2026",
    slug: "chinh-sach-dai-ly-den-nang-luong-mat-troi-phuc-vinh-solar-moi-nhat-2026",
  },
  {
    id: "b3",
    title: "Phúc Vinh Solar Tăng Cường Phối Hợp Vận Hành Nâng Cao Chất Lượng Sản Phẩm",
    excerpt: "Vừa qua, Phúc Vinh Solar tăng cường phối hợp vận hành thông qua chuyến thăm và làm việc trực tiếp...",
    image: blog3,
    date: "27 Tháng 02, 2026",
    slug: "phuc-vinh-solar-tang-cuong-phoi-hop-van-hanh-nang-cao-chat-luong",
  },
  {
    id: "b4",
    title: "Hành Trình Chinh Phục Hệ Thống Đại Lý Đèn NLMT Trên Toàn Quốc Của Phúc Vinh Solar",
    excerpt: "Trong bối cảnh thị trường thiết bị chiếu sáng và năng lượng mặt trời ngày càng cạnh tranh...",
    image: blog4,
    date: "27 Tháng 01, 2026",
    slug: "hanh-trinh-chinh-phuc-he-thong-dai-ly-den-nlmt-tren-toan-quoc",
  },
  {
    id: "b5",
    title: "Cách đọc thông số kỹ thuật đèn năng lượng mặt trời chuẩn cho người mới",
    excerpt: "Bạn từng thấy những mẫu đèn năng lượng mặt trời quảng cáo 300W - 500W - 1000W, nhưng lắp lên thì sáng yếu...",
    image: blog5,
    date: "21 Tháng 01, 2026",
    slug: "cach-doc-thong-so-ky-thuat-den-nang-luong-mat-troi-chuan-cho-nguoi-moi",
  },
  {
    id: "b6",
    title: "Nên chọn đèn năng lượng mặt trời liền thể hay đèn rời tấm pin?",
    excerpt: "Bạn đang phân vân nên chọn đèn năng lượng mặt trời liền thể hay đèn rời tấm pin?...",
    image: blog6,
    date: "14 Tháng 01, 2026",
    slug: "nen-chon-den-nang-luong-mat-troi-lien-the-hay-den-roi-tam-pin",
  },
];
