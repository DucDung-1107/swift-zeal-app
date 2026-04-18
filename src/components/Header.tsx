import { useEffect, useState } from "react";
import { Search, User, ShoppingCart, Menu, ChevronDown, Shield, Truck, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import logo from "/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useServices";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

const Header = () => {
  const { config } = useSiteConfig();
  const { data: services = [] } = useServices();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, signOut } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    let mounted = true;
    const checkAdmin = async () => {
      if (!user) {
        if (mounted) setIsAdmin(false);
        return;
      }
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (mounted) setIsAdmin(!!data);
    };
    checkAdmin();

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }
      if (mounted) setCategories((data || []) as CategoryItem[]);
    };
    fetchCategories();

    return () => {
      mounted = false;
    };
  }, [user]);

  const navItems = [
    { label: config.header_nav_home_label || "TRANG CHỦ", href: "/" },
    {
      label: config.header_nav_products_label || "SẢN PHẨM",
      href: "/collections/all",
      children: categories.map((cat) => ({
        label: cat.name,
        href: `/collections/${cat.slug}`,
      })),
    },
    { label: config.header_nav_blog_label || "BLOG", href: "/blog" },
    { label: config.header_nav_about_label || "GIỚI THIỆU", href: "/gioi-thieu" },
  ];

  return (
    <header className="w-full" style={{ backgroundColor: config.header_background_color || config.primary_color, color: config.header_text_color || config.primary_foreground_color }}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between py-3 gap-4">
          <a href="/" className="flex-shrink-0">
            <img src={config.logo_url || logo} alt={config.brand_name} className="h-16 md:h-16" />
          </a>

          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Input
              type="text"
              placeholder={config.header_search_placeholder || "Tìm kiếm sản phẩm..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 border-border rounded-md"
            />
            <Button size="icon" className="absolute right-0 top-0 h-full rounded-l-none" style={{ backgroundColor: config.header_background_color || config.primary_color }}>
              <Search className="h-4 w-4" style={{ color: config.accent_color }} />
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Xin chào</div>
                  <div className="text-sm font-medium text-foreground">{user.user_metadata?.full_name || user.email}</div>
                </div>
                {isAdmin && (
                  <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                    <a href="/admin">{config.header_management_label || "Management"}</a>
                  </Button>
                )}
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <a href="/my-orders">{config.header_my_orders_label || "Đơn hàng"}</a>
                </Button>
                <button onClick={signOut} className="text-muted-foreground hover:text-destructive transition-colors" title="Đăng xuất">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <a href="/login" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <User className="h-5 w-5" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">{config.header_login_hint || "Đăng nhập / Đăng ký"}</div>
                  <div className="text-sm font-medium">{config.header_my_account_label || "Tài khoản của tôi"}</div>
                </div>
              </a>
            )}
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              <span
                className="absolute -top-2 -right-2 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                style={{ backgroundColor: config.destructive_color, color: config.destructive_foreground_color }}
              >
                {totalItems}
              </span>
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2">
              <ShoppingCart className="h-5 w-5" />
              <span
                className="absolute top-0 right-0 text-xs rounded-full h-4 w-4 flex items-center justify-center"
                style={{ backgroundColor: config.destructive_color, color: config.destructive_foreground_color }}
              >
                {totalItems}
              </span>
            </button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="p-4 border-b">
                  <img src={config.logo_url || logo} alt={config.brand_name} className="h-8" />
                </div>
                <div className="p-4">
                  <Input placeholder="Tìm kiếm..." className="mb-4" />
                  {user ? (
                    <div className="mb-4 pb-4 border-b">
                      <p className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</p>
                      {isAdmin && (
                        <a href="/admin" className="block text-sm text-primary font-medium mt-2 hover:underline">
                          {config.header_management_label || "Management"}
                        </a>
                      )}
                      <a href="/my-orders" className="block text-sm text-primary font-medium mt-2 hover:underline">
                        {config.header_my_orders_label || "Đơn hàng của tôi"}
                      </a>
                      <button onClick={signOut} className="text-sm text-destructive mt-1">Đăng xuất</button>
                    </div>
                  ) : (
                    <div className="mb-4 pb-4 border-b">
                      <a href="/login" className="text-sm text-primary font-medium">Đăng nhập / Đăng ký</a>
                    </div>
                  )}
                  <nav className="space-y-1">
                    {navItems.map((item) => (
                      <div key={item.label}>
                        <a href={item.href} className="block py-2 px-3 text-sm font-medium text-foreground hover:bg-muted rounded-md">
                          {item.label}
                        </a>
                        {item.children && (
                          <div className="pl-4">
                            {item.children.map((child) => (
                              <a key={child.label} href={child.href} className="block py-1.5 px-3 text-sm text-muted-foreground hover:text-primary">
                                {child.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 pb-2 text-xs text-muted-foreground">
          {(services ?? []).slice(0, 3).map((s) => {
            const icon =
              s.icon_key === "truck" ? (
                <Truck className="h-4 w-4 text-primary" />
              ) : s.icon_key === "refresh" ? (
                <RefreshCw className="h-4 w-4 text-primary" />
              ) : (
                <Shield className="h-4 w-4 text-primary" />
              );
            return (
              <div key={s.id} className="flex items-center gap-1.5">
                {icon}
                <span>{s.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <nav style={{ backgroundColor: config.header_nav_background_color || config.foreground_color }}>
        <div className="container mx-auto">
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <a href={item.href} className="flex items-center gap-1 px-5 py-3 text-sm font-medium hover:text-primary transition-colors" style={{ color: config.header_nav_text_color || config.background_color }}>
                    {item.label}
                    {item.children && <ChevronDown className="h-3 w-3" />}
                  </a>
                  {item.children && showDropdown && (
                    <div
                      className="absolute top-full left-0 shadow-lg rounded-b-md min-w-[200px] z-50 border"
                      style={{ backgroundColor: config.background_color }}
                    >
                      {item.children.map((child) => (
                        <a key={child.label} href={child.href} className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors">
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden px-4 py-2" style={{ backgroundColor: config.muted_color }}>
        <div className="relative">
          <Input
            type="text"
            placeholder={config.header_search_placeholder || "Tìm kiếm sản phẩm..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Button size="icon" className="absolute right-0 top-0 h-full rounded-l-none" style={{ backgroundColor: config.header_background_color || config.primary_color }}>
            <Search className="h-4 w-4" style={{ color: config.accent_color }} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
