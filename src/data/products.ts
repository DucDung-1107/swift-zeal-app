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
}

export const categories: Category[] = [
  {
    id: "1",
    name: "ĐÈN PHA NLMT",
    image: "https://theme.hstatic.net/200001032945/1001379709/14/categorybanner_1_img.jpg?v=496",
    slug: "den-pha-nang-luong-mat-troi",
  },
  {
    id: "2",
    name: "ĐÈN ĐƯỜNG NLMT",
    image: "https://theme.hstatic.net/200001032945/1001379709/14/categorybanner_2_img.jpg?v=496",
    slug: "den-duong-nang-luong-mat-troi",
  },
  {
    id: "3",
    name: "ĐÈN NLMT LIỀN THỂ",
    image: "https://theme.hstatic.net/200001032945/1001379709/14/categorybanner_3_img.jpg?v=496",
    slug: "den-nang-luong-mat-troi-lien-the",
  },
  {
    id: "4",
    name: "ĐÈN NLMT KHẨN CẤP",
    image: "https://theme.hstatic.net/200001032945/1001379709/14/categorybanner_4_img.jpg?v=496",
    slug: "den-khan-cap-nang-luong-mat-troi",
  },
];

export const topProducts: Product[] = [
  {
    id: "1",
    name: "DÂY NỐI ĐÈN PHA DÀI 5M",
    slug: "day-noi-dai-5m",
    image: "https://product.hstatic.net/200001032945/product/d_y_n_i_5m_29595ff82652422c8a270b3ab75837c4_small.png",
    price: 100000,
    brand: "ZEALSUN",
    category: "phu-kien",
    inStock: true,
    hasGift: true,
  },
  {
    id: "2",
    name: "DÂY NỐI ĐÈN PHA DÀI 5M ZS619-500",
    slug: "nhan-ban-tu-day-noi-den-pha-dai-5m",
    image: "https://product.hstatic.net/200001032945/product/d_y_n_i_e4173328c2b64070b98acd83606f26b4_small.png",
    price: 220000,
    brand: "ZEALSUN",
    category: "phu-kien",
    inStock: true,
    hasGift: true,
  },
  {
    id: "3",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI LIỀN THỂ",
    slug: "den-nang-luong-mat-troi-lien-the-zs712",
    image: "https://product.hstatic.net/200001032945/product/1_c95773353e9e4ce9a2e203b0e4eb9fed_small.png",
    price: 580000,
    originalPrice: 880000,
    discount: 34,
    brand: "ZEALSUN",
    category: "den-lien-the",
    inStock: true,
    hasGift: true,
  },
  {
    id: "4",
    name: "ĐÈN PHA NĂNG LƯỢNG MẶT TRỜI",
    slug: "den-pha-nang-luong-mat-troi",
    image: "https://product.hstatic.net/200001032945/product/1_50aae4c16285426fa4ccecfadd7d01dc_small.png",
    price: 780000,
    originalPrice: 1050000,
    discount: 26,
    brand: "ZEALSUN",
    category: "den-pha",
    inStock: true,
    hasGift: true,
  },
];

export const trendingProducts = [
  {
    id: "t1",
    name: "ZS616",
    image: "https://theme.hstatic.net/200001032945/1001379709/14/categorize_1_img.jpg?v=496",
    slug: "den-pha-nang-luong-mat-troi-zealsun-zs616",
  },
  {
    id: "t2",
    name: "ZS619",
    image: "https://theme.hstatic.net/200001032945/1001379709/14/categorize_2_img.jpg?v=496",
    slug: "den-pha-nang-luong-mat-troi-zealsun-zs619",
  },
  {
    id: "t3",
    name: "ZS818",
    image: "https://theme.hstatic.net/200001032945/1001379709/14/categorize_3_img.jpg?v=496",
    slug: "bo-den-duong-led-nang-luong-mat-troi-zealsun-zs818",
  },
  {
    id: "t4",
    name: "ZS716",
    image: "https://theme.hstatic.net/200001032945/1001379709/14/categorize_4_img.jpg?v=496",
    slug: "bo-den-duong-led-nang-luong-mat-troi-zealsun-zs716",
  },
  {
    id: "t5",
    name: "ZS711",
    image: "https://theme.hstatic.net/200001032945/1001379709/14/categorize_5_img.jpg?v=496",
    slug: "den-duong-led-lien-the-nang-luong-mat-troi-zealsun-zs711",
  },
  {
    id: "t6",
    name: "ZS717",
    image: "https://theme.hstatic.net/200001032945/1001379709/14/categorize_6_img.jpg?v=496",
    slug: "den-duong-led-lien-the-nang-luong-mat-troi-zealsun-zs717",
  },
  {
    id: "t7",
    name: "ZS611",
    image: "https://theme.hstatic.net/200001032945/1001379709/14/categorize_7_img.jpg?v=496",
    slug: "den-pha-nang-luong-mat-troi-zealsun-zs611",
  },
];

export const newCollectionProducts: Product[] = [
  {
    id: "nc1",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI",
    slug: "zs718-600",
    image: "https://product.hstatic.net/200001032945/product/1_6b93c71b79e5434382e8d3ff43a39bf4_small.png",
    price: 3800000,
    brand: "ZEALSUN",
    category: "den-duong",
    inStock: true,
    hasGift: true,
  },
  {
    id: "nc2",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI",
    slug: "bo-den-duong-led-nang-luong-mat-troi-zealsun-zs818",
    image: "https://product.hstatic.net/200001032945/product/1_9541eb5f6e2c4f5b9f9a25e1a4eb0e6b_small.png",
    price: 1950000,
    brand: "ZEALSUN",
    category: "den-duong",
    inStock: true,
    hasGift: true,
  },
  {
    id: "nc3",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI",
    slug: "bo-den-duong-led-nang-luong-mat-troi-zealsun-zs716",
    image: "https://product.hstatic.net/200001032945/product/1_e8db4e6e6a014e69940aef6c16e2a5a6_small.png",
    price: 1850000,
    brand: "ZEALSUN",
    category: "den-duong",
    inStock: true,
    hasGift: true,
  },
  {
    id: "nc4",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI LIỀN THỂ",
    slug: "den-duong-nang-luong-mat-troi-lien-the",
    image: "https://product.hstatic.net/200001032945/product/1_c95773353e9e4ce9a2e203b0e4eb9fed_small.png",
    price: 4330000,
    brand: "ZEALSUN",
    category: "den-lien-the",
    inStock: true,
    hasGift: true,
  },
  {
    id: "nc5",
    name: "ĐÈN ĐƯỜNG NĂNG LƯỢNG MẶT TRỜI LIỀN THỂ",
    slug: "den-nang-luong-mat-troi-lien-the-zs712",
    image: "https://product.hstatic.net/200001032945/product/1_c95773353e9e4ce9a2e203b0e4eb9fed_small.png",
    price: 580000,
    originalPrice: 880000,
    discount: 34,
    brand: "ZEALSUN",
    category: "den-lien-the",
    inStock: true,
    hasGift: true,
  },
  {
    id: "nc6",
    name: "ĐÈN NĂNG LƯỢNG MẶT TRỜI KHẨN CẤP",
    slug: "den-nang-luong-mat-troi-cam-tay-zs518",
    image: "https://product.hstatic.net/200001032945/product/1_ff0c8a1d5ba040e9a52c9e40a1d19b4a_small.png",
    price: 730000,
    brand: "ZEALSUN",
    category: "den-khan-cap",
    inStock: true,
    hasGift: true,
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    title: "Đèn Năng Lượng Mặt Trời ZS818 – Giải Pháp Chiếu Sáng Mạnh Tiết Kiệm 100% Điện",
    excerpt: "Đèn năng lượng mặt trời ZS818 là dòng đèn NLMT có tấm pin rời, được ưa chuộng nhờ hiệu suất chiếu sáng mạnh...",
    image: "https://file.hstatic.net/200001032945/article/den_duong_nlmt_zs818_chieu_sang_ngoai_troi_f92612693cd24721b56d5f681bbc067c_large.png",
    date: "19 Tháng 03, 2026",
    slug: "den-nang-luong-mat-troi-zs818-giai-phap-chieu-sang-tiet-kiem",
  },
  {
    id: "b2",
    title: "Chính Sách Đại Lý Đèn Năng Lượng Mặt Trời Zealsun Mới Nhất 2026",
    excerpt: "Thị trường đèn năng lượng mặt trời tại Việt Nam đang phát triển mạnh nhờ nhu cầu tiết kiệm điện...",
    image: "https://file.hstatic.net/200001032945/article/chinh_sach_dai_ly_den_nlmt_zeaslun_moi_nhat_2026_e9a2db0eabd4424f803f7b46e108edbd_large.png",
    date: "19 Tháng 03, 2026",
    slug: "chinh-sach-dai-ly-den-nang-luong-mat-troi-zealsun-moi-nhat-2026",
  },
  {
    id: "b3",
    title: "ZEALSUN Tăng Cường Phối Hợp Vận Hành Cùng ZEALSUN China Nâng Cao Chất Lượng",
    excerpt: "Vừa qua, ZEALSUN tăng cường phối hợp vận hành thông qua chuyến thăm và làm việc trực tiếp...",
    image: "https://file.hstatic.net/200001032945/article/zealsun_phoi_hop_nang_cao_chat_luong_he_thong_0dc654e5d43843b5881240cf127e2b67_large.png",
    date: "27 Tháng 02, 2026",
    slug: "zealsun-tang-cuong-phoi-hop-van-hanh-cung-zealsun-china-nang-cao-chat",
  },
  {
    id: "b4",
    title: "Hành Trình Chinh Phục Hệ Thống Đại Lý Đèn NLMT Trên Toàn Quốc Của ZEALSUN",
    excerpt: "Trong bối cảnh thị trường thiết bị chiếu sáng và năng lượng mặt trời ngày càng cạnh tranh...",
    image: "https://file.hstatic.net/200001032945/article/h_trinh_chinh_phuc_he_thong_dai_ly_den_nlmt_tren_toan_quoc_cua_zealsun_37c0127270a948b3bfbf630b46d2a5a9_large.png",
    date: "27 Tháng 01, 2026",
    slug: "hanh-trinh-chinh-phuc-he-thong-dai-ly-den-nlmt-tren-toan-quoc-cua-zealsun",
  },
  {
    id: "b5",
    title: "Cách đọc thông số kỹ thuật đèn năng lượng mặt trời chuẩn cho người mới",
    excerpt: "Bạn từng thấy những mẫu đèn năng lượng mặt trời quảng cáo 300W - 500W - 1000W, nhưng lắp lên thì sáng yếu...",
    image: "https://file.hstatic.net/200001032945/article/huong_dan_cach_doc_thong_so_chuan_den_nlmt_zealsun_875012f8a3364959b2ed80c9564281ae_large.jpg",
    date: "21 Tháng 01, 2026",
    slug: "cach-doc-thong-so-ky-thuat-den-nang-luong-mat-troi-chuan-cho-nguoi-moi",
  },
  {
    id: "b6",
    title: "Nên chọn đèn năng lượng mặt trời liền thể hay đèn rời tấm pin?",
    excerpt: "Bạn đang phân vân nên chọn đèn năng lượng mặt trời liền thể hay đèn rời tấm pin?...",
    image: "https://file.hstatic.net/200001032945/article/nen_chon_den_nang_luong_mat_troi_lien_the_hay_den_roi_tam_pin_aa14beae522c40a4a7ca4db75a5e56ea_large.jpg",
    date: "14 Tháng 01, 2026",
    slug: "nen-chon-den-nang-luong-mat-troi-lien-the-hay-den-roi-tam-pin",
  },
];
