import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Package, ShoppingBag, Plus, Pencil, Trash2, LogOut, Home, Truck, FileText, Shield, RefreshCw, User2, FileEdit, Link, Loader2 } from "lucide-react";
import type { DbProduct } from "@/hooks/useProducts";
import type { Tables } from "@/integrations/supabase/types";
import { categories, blogPosts as staticBlogPosts } from "@/data/products";

type Order = Tables<"orders">;

const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫";

const formatPostDate = (created_at?: string, date?: string) => {
  if (created_at) {
    const d = new Date(created_at);
    if (!isNaN(d.getTime())) return d.toLocaleDateString("vi-VN");
  }
  return date ?? "";
};

const stripDiacritics = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "");

const slugify = (value: string) => {
  const v = stripDiacritics(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return v || "san-pham";
};

const calcBasePriceFromDb = (p: DbProduct) => p.original_price ?? p.price;

const calcCurrentPriceFromDb = (p: DbProduct) => {
  const base = calcBasePriceFromDb(p);
  const discount = p.discount ?? null;
  if (!discount || discount <= 0) return base;
  return Math.round(base * (1 - discount / 100));
};

const fallbackServices = [
  { id: "default-iso", title: "CHỨNG NHẬN ISO QUỐC TẾ", icon_key: "shield", sort_order: 1 },
  { id: "default-ship", title: "VẬN CHUYỂN TOÀN QUỐC", icon_key: "truck", sort_order: 2 },
  { id: "default-warranty", title: "BẢO HÀNH ĐỔI MỚI 2 NĂM", icon_key: "refresh", sort_order: 3 },
];

const Admin = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"products" | "orders" | "users" | "services" | "posts" | "pages">("products");

  // Products state
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [productPreviewUrl, setProductPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    price: "",
    discount: "",
    image_url: "",
    image_file: null as File | null,
    sku: "",
    description: "",
    in_stock: true,
  });
  const [zealsunUrl, setZealsunUrl] = useState("");
  const [importingZealsun, setImportingZealsun] = useState(false);
  type ZealsunVariant = { option: string; price: number; sku: string; in_stock: boolean };
  const [zealsunVariants, setZealsunVariants] = useState<ZealsunVariant[]>([]);
  const [zealsunBaseData, setZealsunBaseData] = useState<any>(null);
  const [showVariantPicker, setShowVariantPicker] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Users state
  type UserRow = {
    user_id: string;
    full_name: string | null;
    phone: string | null;
    address: string | null;
    avatar_url: string | null;
    created_at: string | null;
    role: string | null;
  };
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const supabaseAny = supabase as any;

  // Services state
  type ServiceRow = { id: string; title: string; icon_key: string; sort_order?: number | null; created_at?: string };
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRow | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState<{ title: string; icon_key: string; sort_order: number }>({
    title: "",
    icon_key: "shield",
    sort_order: 0,
  });

  // Posts state
  type BlogPostRow = { id: string; title: string; slug: string; excerpt?: string | null; image_url?: string | null; content?: string | null; created_at?: string; date?: string };
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostRow | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState<{ title: string; slug: string; excerpt: string; image_url: string; content: string }>({
    title: "",
    slug: "",
    excerpt: "",
    image_url: "",
    content: "",
  });

  // Pages state
  type PageRow = { id: string; title: string; slug: string; content: string; sort_order: number | null; created_at?: string };
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [editingPage, setEditingPage] = useState<PageRow | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [pageForm, setPageForm] = useState<{ title: string; slug: string; content: string; sort_order: number }>({
    title: "",
    slug: "",
    content: "",
    sort_order: 0,
  });

  // Latest posts panel (dashboard)
  const [latestPosts, setLatestPosts] = useState<BlogPostRow[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (!data) { navigate("/"); toast({ title: "Không có quyền truy cập", variant: "destructive" }); }
      else setIsAdmin(true);
      setChecking(false);
    });
  }, [user, loading, navigate, toast]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchLatestPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (!showForm) {
      setProductPreviewUrl(null);
      return;
    }

    if (form.image_file) {
      const url = URL.createObjectURL(form.image_file);
      setProductPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }

    setProductPreviewUrl(form.image_url || null);
  }, [showForm, form.image_file, form.image_url]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === "products") fetchProducts();
    else if (tab === "orders") fetchOrders();
    else if (tab === "users") fetchUsers();
    else if (tab === "services") fetchServices();
    else if (tab === "posts") fetchPosts();
    else if (tab === "pages") fetchPages();
  }, [isAdmin, tab]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoadingProducts(false);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setLoadingOrders(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data: profiles } = await supabaseAny
        .from("profiles")
        .select("user_id, full_name, phone, address, avatar_url, created_at")
        .order("created_at", { ascending: false });

      const profileRows = (profiles || []) as any[];
      const userIds = profileRows.map((p) => p.user_id).filter(Boolean);

      let roleByUserId = new Map<string, string>();
      if (userIds.length > 0) {
        const { data: roles } = await supabaseAny
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", userIds);

        (roles || []).forEach((r: any) => {
          if (!r?.user_id) return;
          // Nếu có nhiều role thì ưu tiên admin/moderator trước.
          const current = roleByUserId.get(String(r.user_id)) ?? null;
          const next = String(r.role ?? "user");
          const score = (role: string | null) => {
            if (role === "admin") return 3;
            if (role === "moderator") return 2;
            return 1;
          };
          if (!current || score(next) > score(current)) roleByUserId.set(String(r.user_id), next);
        });
      }

      setUsers(
        profileRows.map((p: any) => ({
          user_id: String(p.user_id),
          full_name: p.full_name ?? null,
          phone: p.phone ?? null,
          address: p.address ?? null,
          avatar_url: p.avatar_url ?? null,
          created_at: p.created_at ?? null,
          role: roleByUserId.get(String(p.user_id)) ?? null,
        })),
      );
    } catch (e: any) {
      toast({ title: "Lỗi tải người dùng", description: e?.message ?? "Vui lòng thử lại.", variant: "destructive" });
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    if (!confirm("Xác nhận cập nhật vai trò người dùng?")) return;
    try {
      await supabaseAny.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabaseAny.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
      toast({ title: "Đã cập nhật vai trò" });
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Lỗi cập nhật vai trò", description: e?.message ?? "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const { data, error } = await supabaseAny.from("services").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      setServices((data || []) as ServiceRow[]);
    } catch (e: any) {
      const message = String(e?.message ?? "");
      const isMissingTable = e?.code === "42P01" || message.toLowerCase().includes("does not exist") || message.toLowerCase().includes("relation");
      if (isMissingTable) {
        setServices(fallbackServices as any);
        return;
      }
      toast({ title: "Lỗi tải dịch vụ", description: message || "Vui lòng thử lại.", variant: "destructive" });
      setServices(fallbackServices as any);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const { data, error } = await supabaseAny.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPosts((data || []) as BlogPostRow[]);
    } catch (e: any) {
      const message = String(e?.message ?? "");
      const isMissingTable = e?.code === "42P01" || message.toLowerCase().includes("does not exist") || message.toLowerCase().includes("relation");
      if (isMissingTable) {
        setPosts(
          staticBlogPosts.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            image_url: p.image,
            created_at: undefined,
            date: p.date,
            content: "",
          })),
        );
        return;
      }
      toast({ title: "Lỗi tải bài đăng", description: message || "Vui lòng thử lại.", variant: "destructive" });
      setPosts(
        staticBlogPosts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          image_url: p.image,
          created_at: undefined,
          date: p.date,
          content: "",
        })),
      );
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchLatestPosts = async () => {
    try {
      const { data, error } = await supabaseAny.from("blog_posts").select("*").order("created_at", { ascending: false }).limit(3);
      if (error) throw error;

      if (data && Array.isArray(data) && data.length > 0) {
        setLatestPosts(data as BlogPostRow[]);
        return;
      }
    } catch {
      // fallback demo
      setLatestPosts(
        staticBlogPosts.slice(0, 3).map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          image_url: p.image,
          created_at: undefined,
          date: p.date,
          content: "",
        })),
      );
    }
  };

  const importFromZealsun = async () => {
    if (!zealsunUrl.includes("zealsun.vn/products/")) {
      toast({ title: "URL không hợp lệ", description: "Vui lòng nhập URL sản phẩm từ zealsun.vn", variant: "destructive" });
      return;
    }
    setImportingZealsun(true);
    setZealsunVariants([]);
    setZealsunBaseData(null);
    setShowVariantPicker(false);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-zealsun", { body: { url: zealsunUrl } });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Không parse được");
      const d = data.data;

      if (d.has_variants && d.variants?.length > 1) {
        // Store base data and show variant picker
        setZealsunBaseData(d);
        setZealsunVariants(d.variants);
        setShowVariantPicker(true);
        toast({ title: `Tìm thấy ${d.variants.length} biến thể`, description: "Chọn biến thể để nhập" });
      } else {
        // Single product, fill form directly
        fillFormFromZealsun(d, null);
        toast({ title: "Đã nhập thành công từ ZealSun!" });
      }
    } catch (e: any) {
      toast({ title: "Lỗi nhập từ ZealSun", description: e?.message, variant: "destructive" });
    } finally {
      setImportingZealsun(false);
    }
  };

  const fillFormFromZealsun = (baseData: any, variant: ZealsunVariant | null) => {
    const variantSuffix = variant ? ` ${variant.option}` : "";
    const variantSlugSuffix = variant ? `-${variant.option.toLowerCase().replace(/\s+/g, "-")}` : "";
    setForm({
      name: (baseData.name || "") + variantSuffix,
      slug: (baseData.slug || "") + variantSlugSuffix,
      category: form.category || (categories[0]?.category ?? "den-pha"),
      price: variant ? String(variant.price) : (baseData.price ? String(baseData.price) : form.price),
      discount: baseData.discount ? String(baseData.discount) : form.discount,
      image_url: baseData.image_url || form.image_url,
      image_file: null,
      sku: variant ? variant.sku : (baseData.sku || form.sku),
      description: baseData.description || form.description,
      in_stock: variant ? variant.in_stock : (baseData.in_stock ?? true),
    });
    setShowVariantPicker(false);
  };

  const importAllVariants = async () => {
    if (!zealsunBaseData || zealsunVariants.length === 0) return;
    const categoryToUse = form.category || (categories[0]?.category ?? "den-pha");
    let count = 0;
    for (const v of zealsunVariants) {
      if (v.price <= 0) continue; // Skip variants with 0 price (likely unavailable)
      const variantSuffix = ` ${v.option}`;
      const variantSlugSuffix = `-${v.option.toLowerCase().replace(/\s+/g, "-")}`;
      const payload: any = {
        name: (zealsunBaseData.name || "") + variantSuffix,
        slug: `${zealsunBaseData.slug || "sp"}${variantSlugSuffix}-${Date.now().toString(36)}`,
        category: categoryToUse,
        price: v.price,
        discount: zealsunBaseData.discount || null,
        brand: "PV SOLAR",
        image_url: zealsunBaseData.image_url || null,
        in_stock: v.in_stock,
        has_gift: false,
        original_price: null,
        sku: v.sku,
        description: zealsunBaseData.description || null,
      };
      const { error } = await supabase.from("products").insert(payload);
      if (!error) count++;
    }
    toast({ title: `Đã nhập ${count}/${zealsunVariants.length} biến thể` });
    setShowVariantPicker(false);
    setZealsunVariants([]);
    setZealsunBaseData(null);
    setShowForm(false);
    fetchProducts();
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setZealsunUrl("");
    setForm({
      name: "",
      slug: "",
      category: categories[0]?.category ?? "den-pha",
      price: "",
      discount: "",
      image_url: "",
      image_file: null,
      sku: "",
      description: "",
      in_stock: true,
    });
    setShowForm(true);
  };

  const openEditProduct = (p: DbProduct) => {
    setEditingProduct(p);
    setZealsunUrl("");
    setForm({
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: String(p.price),
      discount: p.discount ? String(p.discount) : "",
      image_url: p.image_url || "",
      image_file: null,
      sku: (p as any).sku || "",
      description: (p as any).description || "",
      in_stock: p.in_stock,
    });
    setShowForm(true);
  };

  const saveProduct = async () => {
    const name = form.name.trim();
    const basePrice = parseInt(form.price) || 0;
    const discount = form.discount.trim() ? parseInt(form.discount) : null;

    if (!name) {
      toast({ title: "Vui lòng nhập tên sản phẩm", variant: "destructive" });
      return;
    }
    if (!basePrice || basePrice <= 0) {
      toast({ title: "Giá không hợp lệ", variant: "destructive" });
      return;
    }

    if (!editingProduct && !form.image_file && !form.image_url) {
      toast({ title: "Vui lòng upload ảnh hoặc nhập URL sản phẩm", variant: "destructive" });
      return;
    }

    let imageUrl: string | null = editingProduct?.image_url ?? null;
    if (form.image_file) {
      const bucket = "product-images";
      const slugBase = slugify(name);
      const fileExt = form.image_file.name.split(".").pop();
      const safeExt = fileExt ? `.${fileExt}` : "";
      const storagePath = `products/${slugBase}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}${safeExt}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, form.image_file, {
        upsert: true,
        contentType: form.image_file.type || undefined,
      });
      if (uploadError) {
        const message = uploadError.message || "Không upload được ảnh. Vui lòng kiểm tra bucket & quyền truy cập.";
        const lowered = message.toLowerCase();

        const isBucketNotFound =
          lowered.includes("bucket") && (lowered.includes("not found") || lowered.includes("notfound") || lowered.includes("does not exist"));

        if (isBucketNotFound) {
          // Tạo bucket nếu chưa có (đỡ phải chạy SQL thủ công).
          try {
            const result = await supabaseAny.storage.createBucket(bucket, { public: true });
            // Supabase có thể trả error hoặc throw; gom chung xử lý dưới.
            if ((result as any)?.error) throw (result as any).error;

            const { error: retryError } = await supabase.storage.from(bucket).upload(storagePath, form.image_file, {
              upsert: true,
              contentType: form.image_file.type || undefined,
            });

            if (retryError) {
              toast({
                title: "Lỗi upload ảnh",
                description: retryError.message || message,
                variant: "destructive",
              });
              return;
            }

            const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
            imageUrl = publicData.publicUrl;
          } catch (e: any) {
            toast({
              title: "Lỗi upload ảnh (tạo bucket thất bại)",
              description: e?.message ?? message,
              variant: "destructive",
            });
            return;
          }
        } else {
          const hint =
            lowered.includes("bucket") || lowered.includes("not found")
              ? "Gợi ý: kiểm tra bucket `product-images` và chạy migration lưu bucket/policies."
              : "";
          toast({ title: "Lỗi upload ảnh", description: hint ? `${message}\n${hint}` : message, variant: "destructive" });
          return;
        }
      }

      if (!imageUrl) {
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
        imageUrl = publicData.publicUrl;
      }
    } else {
      imageUrl = form.image_url || imageUrl;
    }

    const categoryToSave = form.category || editingProduct?.category || "";
    if (!categoryToSave) {
      toast({ title: "Vui lòng chọn danh mục cho sản phẩm", variant: "destructive" });
      return;
    }

    const parsedDiscount = discount && discount > 0 ? discount : null;

    if (editingProduct) {
      const payload: any = {
        name,
        category: categoryToSave,
        price: basePrice,
        discount: parsedDiscount,
        image_url: imageUrl,
        original_price: null,
        sku: form.sku.trim() || null,
        description: form.description.trim() || null,
        in_stock: form.in_stock,
      };

      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) { toast({ title: "Lỗi cập nhật", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Đã cập nhật sản phẩm" });
    } else {
      const slug = form.slug.trim() ? form.slug.trim() : `${slugify(name)}-${Date.now().toString(36)}`;
      const payload: any = {
        name,
        slug,
        category: categoryToSave,
        price: basePrice,
        discount: parsedDiscount,
        brand: "PV SOLAR",
        image_url: imageUrl,
        in_stock: form.in_stock,
        has_gift: false,
        original_price: null,
        sku: form.sku.trim() || null,
        description: form.description.trim() || null,
      };

      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast({ title: "Lỗi thêm sản phẩm", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Đã thêm sản phẩm mới" });
    }
    setShowForm(false);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Xác nhận xóa sản phẩm?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Đã xóa sản phẩm" });
    fetchProducts();
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) { toast({ title: "Lỗi cập nhật", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Đã cập nhật trạng thái: ${status}` });
    fetchOrders();
  };

  const openNewService = () => {
    setEditingService(null);
    setServiceForm({ title: "", icon_key: "shield", sort_order: 0 });
    setShowServiceForm(true);
  };

  const openEditService = (s: ServiceRow) => {
    setEditingService(s);
    setServiceForm({
      title: s.title,
      icon_key: s.icon_key ?? "shield",
      sort_order: typeof s.sort_order === "number" ? s.sort_order : 0,
    });
    setShowServiceForm(true);
  };

  const saveService = async () => {
    const payload = {
      title: serviceForm.title.trim(),
      icon_key: serviceForm.icon_key,
      sort_order: Number(serviceForm.sort_order) || 0,
    };

    try {
      if (editingService) {
        const { error } = await supabaseAny.from("services").update(payload).eq("id", editingService.id);
        if (error) throw error;
        toast({ title: "Đã cập nhật dịch vụ" });
      } else {
        const { error } = await supabaseAny.from("services").insert(payload);
        if (error) throw error;
        toast({ title: "Đã thêm dịch vụ mới" });
      }
      setShowServiceForm(false);
      fetchServices();
    } catch (e: any) {
      toast({ title: "Lỗi lưu dịch vụ", description: e?.message ?? "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Xác nhận xóa dịch vụ?")) return;
    try {
      const { error } = await supabaseAny.from("services").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Đã xóa dịch vụ" });
      fetchServices();
    } catch (e: any) {
      toast({ title: "Lỗi xóa dịch vụ", description: e?.message ?? "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  const openNewPost = () => {
    setEditingPost(null);
    setPostForm({ title: "", slug: "", excerpt: "", image_url: "", content: "" });
    setShowPostForm(true);
  };

  const openEditPost = (p: BlogPostRow) => {
    setEditingPost(p);
    setPostForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? "",
      image_url: p.image_url ?? "",
      content: p.content ?? "",
    });
    setShowPostForm(true);
  };

  const savePost = async () => {
    const payload = {
      title: postForm.title.trim(),
      slug: postForm.slug.trim(),
      excerpt: postForm.excerpt.trim() || null,
      image_url: postForm.image_url.trim() || null,
      content: postForm.content.trim() || null,
    };

    try {
      if (editingPost) {
        const { error } = await supabaseAny.from("blog_posts").update(payload).eq("id", editingPost.id);
        if (error) throw error;
        toast({ title: "Đã cập nhật bài đăng" });
      } else {
        const { error } = await supabaseAny.from("blog_posts").insert(payload);
        if (error) throw error;
        toast({ title: "Đã thêm bài đăng mới" });
      }
      setShowPostForm(false);
      fetchPosts();
      fetchLatestPosts();
    } catch (e: any) {
      toast({ title: "Lỗi lưu bài đăng", description: e?.message ?? "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Xác nhận xóa bài đăng?")) return;
    try {
      const { error } = await supabaseAny.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Đã xóa bài đăng" });
      fetchPosts();
      fetchLatestPosts();
    } catch (e: any) {
      toast({ title: "Lỗi xóa bài đăng", description: e?.message ?? "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  // Pages CRUD
  const fetchPages = async () => {
    setLoadingPages(true);
    try {
      const { data, error } = await supabaseAny.from("pages").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      setPages((data || []) as PageRow[]);
    } catch (e: any) {
      toast({ title: "Lỗi tải trang", description: e?.message, variant: "destructive" });
      setPages([]);
    } finally {
      setLoadingPages(false);
    }
  };

  const openNewPage = () => {
    setEditingPage(null);
    setPageForm({ title: "", slug: "", content: "", sort_order: 0 });
    setShowPageForm(true);
  };

  const openEditPage = (p: PageRow) => {
    setEditingPage(p);
    setPageForm({ title: p.title, slug: p.slug, content: p.content || "", sort_order: p.sort_order ?? 0 });
    setShowPageForm(true);
  };

  const savePage = async () => {
    const payload = { title: pageForm.title.trim(), slug: pageForm.slug.trim(), content: pageForm.content, sort_order: pageForm.sort_order };
    try {
      if (editingPage) {
        const { error } = await supabaseAny.from("pages").update(payload).eq("id", editingPage.id);
        if (error) throw error;
        toast({ title: "Đã cập nhật trang" });
      } else {
        const { error } = await supabaseAny.from("pages").insert(payload);
        if (error) throw error;
        toast({ title: "Đã thêm trang mới" });
      }
      setShowPageForm(false);
      fetchPages();
    } catch (e: any) {
      toast({ title: "Lỗi lưu trang", description: e?.message, variant: "destructive" });
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Xác nhận xóa trang?")) return;
    try {
      const { error } = await supabaseAny.from("pages").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Đã xóa trang" });
      fetchPages();
    } catch (e: any) {
      toast({ title: "Lỗi xóa trang", description: e?.message, variant: "destructive" });
    }
  };

  if (loading || checking) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted">
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 min-h-screen bg-primary text-primary-foreground p-6 hidden md:block">
          <h1 className="text-xl font-bold mb-8">PV SOLAR Admin</h1>
          <nav className="space-y-2">
            <button onClick={() => setTab("products")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tab === "products" ? "bg-primary-foreground/20" : "hover:bg-primary-foreground/10"}`}>
              <Package className="h-5 w-5" />Sản phẩm
            </button>
            <button onClick={() => setTab("orders")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tab === "orders" ? "bg-primary-foreground/20" : "hover:bg-primary-foreground/10"}`}>
              <ShoppingBag className="h-5 w-5" />Đơn hàng
            </button>
            <button onClick={() => setTab("users")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tab === "users" ? "bg-primary-foreground/20" : "hover:bg-primary-foreground/10"}`}>
              <User2 className="h-5 w-5" />Người dùng
            </button>
            <button onClick={() => setTab("services")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tab === "services" ? "bg-primary-foreground/20" : "hover:bg-primary-foreground/10"}`}>
              <Truck className="h-5 w-5" />Dịch vụ
            </button>
            <button onClick={() => setTab("posts")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tab === "posts" ? "bg-primary-foreground/20" : "hover:bg-primary-foreground/10"}`}>
              <FileText className="h-5 w-5" />Bài đăng
            </button>
            <button onClick={() => setTab("pages")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tab === "pages" ? "bg-primary-foreground/20" : "hover:bg-primary-foreground/10"}`}>
              <FileEdit className="h-5 w-5" />Trang nội dung
            </button>
          </nav>
          <div className="mt-auto pt-8 space-y-2">
            <a href="/" className="flex items-center gap-2 text-sm hover:underline"><Home className="h-4 w-4" />Về trang chủ</a>
            <button onClick={signOut} className="flex items-center gap-2 text-sm hover:underline"><LogOut className="h-4 w-4" />Đăng xuất</button>
          </div>
        </aside>

        <main className="flex-1 p-6">
          {/* Mobile nav */}
          <div className="md:hidden flex flex-wrap gap-2 mb-4">
            <Button variant={tab === "products" ? "default" : "outline"} size="sm" onClick={() => setTab("products")}><Package className="h-4 w-4 mr-1" />Sản phẩm</Button>
            <Button variant={tab === "orders" ? "default" : "outline"} size="sm" onClick={() => setTab("orders")}><ShoppingBag className="h-4 w-4 mr-1" />Đơn hàng</Button>
            <Button variant={tab === "users" ? "default" : "outline"} size="sm" onClick={() => setTab("users")}><User2 className="h-4 w-4 mr-1" />Người dùng</Button>
            <Button variant={tab === "services" ? "default" : "outline"} size="sm" onClick={() => setTab("services")}><Truck className="h-4 w-4 mr-1" />Dịch vụ</Button>
            <Button variant={tab === "posts" ? "default" : "outline"} size="sm" onClick={() => setTab("posts")}><FileText className="h-4 w-4 mr-1" />Bài đăng</Button>
            <Button variant={tab === "pages" ? "default" : "outline"} size="sm" onClick={() => setTab("pages")}><FileEdit className="h-4 w-4 mr-1" />Trang</Button>
            <a href="/" className="ml-auto"><Button variant="ghost" size="sm"><Home className="h-4 w-4" /></Button></a>
          </div>

          <div className="mb-6 bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-foreground">Bài đăng mới nhất</h3>
              <a href="/blog" className="text-sm text-primary hover:underline font-medium">
                Xem tất cả
              </a>
            </div>
            {latestPosts.length > 0 ? (
              <div className="space-y-2">
                {latestPosts.map((p) => (
                  <a
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="block p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground line-clamp-1">{p.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{formatPostDate(p.created_at, p.date)}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có bài đăng để hiển thị.</p>
            )}
          </div>

          {tab === "products" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Quản lý sản phẩm ({products.length})</h2>
                <Button onClick={openNewProduct}><Plus className="h-4 w-4 mr-1" />Thêm sản phẩm</Button>
              </div>

              {showForm && (
                <div className="bg-card border rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-foreground mb-4">{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>

                  {/* ZealSun URL Import */}
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-4">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                      <Link className="h-4 w-4 text-accent" />Nhập nhanh từ ZealSun
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={zealsunUrl}
                        onChange={(e) => setZealsunUrl(e.target.value)}
                        placeholder="https://zealsun.vn/products/ten-san-pham"
                        className="flex-1"
                      />
                      <Button onClick={importFromZealsun} disabled={importingZealsun} variant="outline">
                        {importingZealsun ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Đang nhập...</> : <>Nhập</>}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Dán link sản phẩm từ zealsun.vn để tự động điền thông tin</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Tên sản phẩm *</label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Mã sản phẩm (SKU)</label>
                      <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="VD: ZS712" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Danh mục *</label>
                      <select
                        className="mt-2 w-full border rounded-md px-3 py-2 bg-background text-foreground"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.category}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Giá (VND) *</label>
                      <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Giảm giá (%)</label>
                      <Input
                        type="number"
                        value={form.discount}
                        onChange={(e) => setForm({ ...form, discount: e.target.value })}
                        placeholder="VD: 10"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Tình trạng</label>
                      <select
                        className="mt-2 w-full border rounded-md px-3 py-2 bg-background text-foreground"
                        value={form.in_stock ? "1" : "0"}
                        onChange={(e) => setForm({ ...form, in_stock: e.target.value === "1" })}
                      >
                        <option value="1">Còn hàng (hiển thị)</option>
                        <option value="0">Hết hàng (ẩn)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Mô tả sản phẩm</label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        placeholder="Mô tả chi tiết sản phẩm..."
                        className="mt-2"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground">
                        Ảnh sản phẩm {editingProduct ? "(tuỳ chọn khi sửa)" : "*"}
                      </label>
                      <div className="mt-2 flex flex-col md:flex-row gap-4 items-start">
                        <div className="w-full md:flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              setForm({ ...form, image_file: file });
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-2">Upload ảnh hoặc sử dụng URL từ ZealSun.</p>
                          {form.image_url && !form.image_file && (
                            <p className="text-xs text-primary mt-1 truncate">URL ảnh: {form.image_url}</p>
                          )}
                        </div>

                        {(productPreviewUrl || form.image_url) && (
                          <div className="w-32 h-32 bg-muted rounded-lg border overflow-hidden flex items-center justify-center flex-shrink-0">
                            <img
                              src={productPreviewUrl || form.image_url}
                              alt="preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={saveProduct}>Lưu</Button>
                    <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                  </div>
                </div>
              )}

              <div className="bg-card border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium text-foreground">Ảnh</th>
                      <th className="text-left p-3 font-medium text-foreground">SKU</th>
                      <th className="text-left p-3 font-medium text-foreground">Tên</th>
                      <th className="text-left p-3 font-medium text-foreground">Danh mục</th>
                      <th className="text-right p-3 font-medium text-foreground">Giá</th>
                      <th className="text-center p-3 font-medium text-foreground">Trạng thái</th>
                      <th className="text-right p-3 font-medium text-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3"><img src={p.image_url || "/placeholder.svg"} alt="" className="h-12 w-12 object-contain rounded" /></td>
                        <td className="p-3 text-muted-foreground font-mono text-xs">{(p as any).sku || "-"}</td>
                        <td className="p-3 font-medium text-foreground">{p.name}</td>
                        <td className="p-3 text-muted-foreground">{p.category}</td>
                      <td className="p-3 text-right">
                        {p.discount && p.discount > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground line-through">{formatPrice(calcBasePriceFromDb(p))}</span>
                            <span className="text-accent font-bold">{formatPrice(calcCurrentPriceFromDb(p))}</span>
                          </div>
                        ) : (
                          <span className="text-accent font-bold">{formatPrice(p.price)}</span>
                        )}
                      </td>
                        <td className="p-3 text-center"><span className={`text-xs px-2 py-1 rounded-full ${p.in_stock ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{p.in_stock ? "Còn hàng" : "Hết hàng"}</span></td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditProduct(p)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && !loadingProducts && (
                  <div className="p-8 text-center text-muted-foreground">Chưa có sản phẩm nào</div>
                )}
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Quản lý đơn hàng ({orders.length})</h2>
              <div className="bg-card border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium text-foreground">Mã đơn</th>
                      <th className="text-left p-3 font-medium text-foreground">Khách hàng</th>
                      <th className="text-left p-3 font-medium text-foreground">SĐT</th>
                      <th className="text-right p-3 font-medium text-foreground">Tổng tiền</th>
                      <th className="text-center p-3 font-medium text-foreground">Trạng thái</th>
                      <th className="text-center p-3 font-medium text-foreground">Hóa đơn</th>
                      <th className="text-left p-3 font-medium text-foreground">Ngày tạo</th>
                      <th className="text-right p-3 font-medium text-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="p-3 font-mono text-xs text-foreground">{o.id.slice(0, 8)}...</td>
                        <td className="p-3 text-foreground">{o.full_name}</td>
                        <td className="p-3 text-muted-foreground">{o.phone}</td>
                        <td className="p-3 text-right text-accent font-bold">{formatPrice(o.total)}</td>
                        <td className="p-3 text-center">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="text-xs border rounded px-2 py-1 bg-background text-foreground"
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="shipping">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                        <td className="p-3 text-center">{o.invoice_requested ? <span className="text-xs text-accent font-medium">Có</span> : <span className="text-xs text-muted-foreground">Không</span>}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("vi-VN")}</td>
                        <td className="p-3 text-right">
                          {o.invoice_requested && (
                            <div className="text-xs text-muted-foreground text-left">
                              <p>CTy: {o.invoice_company_name}</p>
                              <p>MST: {o.invoice_tax_code}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && !loadingOrders && (
                  <div className="p-8 text-center text-muted-foreground">Chưa có đơn hàng nào</div>
                )}
              </div>
            </div>
          )}

          {tab === "users" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Quản lý người dùng ({users.length})</h2>
              <div className="bg-card border rounded-lg overflow-x-auto">
                {loadingUsers ? (
                  <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium text-foreground">Tên</th>
                        <th className="text-left p-3 font-medium text-foreground">SĐT</th>
                        <th className="text-left p-3 font-medium text-foreground">Địa chỉ</th>
                        <th className="text-left p-3 font-medium text-foreground">Vai trò</th>
                        <th className="text-left p-3 font-medium text-foreground">Ngày tạo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.user_id} className="border-t">
                          <td className="p-3 text-foreground font-medium">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar_url || "/placeholder.svg"}
                                alt=""
                                className="h-10 w-10 object-contain bg-muted rounded-full"
                              />
                              <div className="min-w-0">
                                <div className="truncate">{u.full_name || "Chưa có tên"}</div>
                                <div className="text-xs text-muted-foreground font-mono">{u.user_id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{u.phone || "-"}</td>
                          <td className="p-3 text-muted-foreground">{u.address || "-"}</td>
                          <td className="p-3">
                            <select
                              value={u.role ?? "user"}
                              onChange={(e) => updateUserRole(u.user_id, e.target.value)}
                              className="text-xs border rounded px-2 py-1 bg-background text-foreground"
                            >
                              <option value="user">User</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString("vi-VN") : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {users.length === 0 && !loadingUsers && (
                  <div className="p-8 text-center text-muted-foreground">Chưa có dữ liệu người dùng</div>
                )}
              </div>
            </div>
          )}

          {tab === "services" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Quản lý dịch vụ ({services.length})</h2>

              {showServiceForm && (
                <div className="bg-card border rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-foreground mb-4">{editingService ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Tiêu đề *</label>
                      <Input className="mt-2" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Icon *</label>
                      <select
                        className="mt-2 w-full border rounded-md px-3 py-2 bg-background text-foreground"
                        value={serviceForm.icon_key}
                        onChange={(e) => setServiceForm({ ...serviceForm, icon_key: e.target.value })}
                      >
                        <option value="shield">ISO / Chứng nhận</option>
                        <option value="truck">Vận chuyển</option>
                        <option value="refresh">Bảo hành</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Thứ tự</label>
                      <Input
                        className="mt-2"
                        type="number"
                        value={serviceForm.sort_order}
                        onChange={(e) => setServiceForm({ ...serviceForm, sort_order: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" onClick={saveService}>
                        Lưu
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowServiceForm(false)} className="w-fit">
                      Hủy
                    </Button>
                    {editingService ? null : (
                      <Button variant="ghost" onClick={openNewService} className="w-fit">
                        Reset form
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <Button onClick={openNewService}>
                  <Plus className="h-4 w-4 mr-1" />Thêm dịch vụ
                </Button>
              </div>

              <div className="bg-card border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium text-foreground">Icon</th>
                      <th className="text-left p-3 font-medium text-foreground">Tiêu đề</th>
                      <th className="text-left p-3 font-medium text-foreground">Thứ tự</th>
                      <th className="text-right p-3 font-medium text-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => {
                      const icon =
                        s.icon_key === "truck" ? (
                          <Truck className="h-4 w-4 text-primary" />
                        ) : s.icon_key === "refresh" ? (
                          <RefreshCw className="h-4 w-4 text-primary" />
                        ) : (
                          <Shield className="h-4 w-4 text-primary" />
                        );

                      return (
                        <tr key={s.id} className="border-t">
                          <td className="p-3">{icon}</td>
                          <td className="p-3 font-medium text-foreground">{s.title}</td>
                          <td className="p-3 text-muted-foreground">{s.sort_order ?? 0}</td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditService(s)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteService(s.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {services.length === 0 && !loadingServices && (
                  <div className="p-8 text-center text-muted-foreground">Chưa có dịch vụ</div>
                )}
              </div>
            </div>
          )}

          {tab === "posts" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Quản lý bài đăng ({posts.length})</h2>

              {showPostForm && (
                <div className="bg-card border rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-foreground mb-4">{editingPost ? "Sửa bài đăng" : "Thêm bài đăng mới"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Tiêu đề *</label>
                      <Input className="mt-2" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Slug *</label>
                      <Input className="mt-2" value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Tóm tắt</label>
                      <Textarea
                        className="mt-2"
                        value={postForm.excerpt}
                        onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">URL ảnh</label>
                      <Input className="mt-2" value={postForm.image_url} onChange={(e) => setPostForm({ ...postForm, image_url: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Nội dung</label>
                      <Textarea
                        className="mt-2"
                        value={postForm.content}
                        onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                        rows={6}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={savePost}>Lưu</Button>
                    <Button variant="outline" onClick={() => setShowPostForm(false)}>
                      Hủy
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <Button onClick={openNewPost}>
                  <Plus className="h-4 w-4 mr-1" />Thêm bài đăng
                </Button>
              </div>

              <div className="bg-card border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium text-foreground">Ảnh</th>
                      <th className="text-left p-3 font-medium text-foreground">Tiêu đề</th>
                      <th className="text-left p-3 font-medium text-foreground">Slug</th>
                      <th className="text-left p-3 font-medium text-foreground">Ngày</th>
                      <th className="text-right p-3 font-medium text-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">
                          <img
                            src={p.image_url || "/placeholder.svg"}
                            alt=""
                            className="h-12 w-12 object-contain rounded bg-muted"
                          />
                        </td>
                        <td className="p-3 font-medium text-foreground">{p.title}</td>
                        <td className="p-3 text-muted-foreground font-mono text-xs">{p.slug}</td>
                        <td className="p-3 text-muted-foreground">{formatPostDate(p.created_at, p.date)}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditPost(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deletePost(p.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {posts.length === 0 && !loadingPosts && (
                  <div className="p-8 text-center text-muted-foreground">Chưa có bài đăng</div>
                )}
              </div>
            </div>
          )}

          {tab === "pages" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Trang nội dung ({pages.length})</h2>
                <Button onClick={openNewPage}><Plus className="h-4 w-4 mr-1" />Thêm trang</Button>
              </div>

              {showPageForm && (
                <div className="bg-card border rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-foreground mb-4">{editingPage ? "Sửa trang" : "Thêm trang mới"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Tiêu đề *</label>
                      <Input className="mt-2" value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Slug *</label>
                      <Input className="mt-2" value={pageForm.slug} onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })} placeholder="vd: chinh-sach-bao-hanh" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Thứ tự</label>
                      <Input className="mt-2" type="number" value={pageForm.sort_order} onChange={(e) => setPageForm({ ...pageForm, sort_order: Number(e.target.value) })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Nội dung</label>
                      <Textarea className="mt-2" value={pageForm.content} onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })} rows={10} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={savePage}>Lưu</Button>
                    <Button variant="outline" onClick={() => setShowPageForm(false)}>Hủy</Button>
                  </div>
                </div>
              )}

              <div className="bg-card border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium text-foreground">Tiêu đề</th>
                      <th className="text-left p-3 font-medium text-foreground">Slug</th>
                      <th className="text-left p-3 font-medium text-foreground">Thứ tự</th>
                      <th className="text-right p-3 font-medium text-foreground">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3 font-medium text-foreground">{p.title}</td>
                        <td className="p-3 text-muted-foreground font-mono text-xs">{p.slug}</td>
                        <td className="p-3 text-muted-foreground">{p.sort_order ?? 0}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditPage(p)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deletePage(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pages.length === 0 && !loadingPages && (
                  <div className="p-8 text-center text-muted-foreground">Chưa có trang nào</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
