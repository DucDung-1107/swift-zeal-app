import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Package, ShoppingBag, Plus, Pencil, Trash2, LogOut, Home } from "lucide-react";
import type { DbProduct } from "@/hooks/useProducts";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫";

const Admin = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"products" | "orders">("products");

  // Products state
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", category: "", price: "", original_price: "", discount: "", brand: "PV SOLAR", image_url: "", in_stock: true, has_gift: false });

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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
    if (tab === "products") fetchProducts();
    else fetchOrders();
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

  const openNewProduct = () => {
    setEditingProduct(null);
    setForm({ name: "", slug: "", category: "", price: "", original_price: "", discount: "", brand: "PV SOLAR", image_url: "", in_stock: true, has_gift: false });
    setShowForm(true);
  };

  const openEditProduct = (p: DbProduct) => {
    setEditingProduct(p);
    setForm({ name: p.name, slug: p.slug, category: p.category, price: String(p.price), original_price: p.original_price ? String(p.original_price) : "", discount: p.discount ? String(p.discount) : "", brand: p.brand, image_url: p.image_url || "", in_stock: p.in_stock, has_gift: p.has_gift || false });
    setShowForm(true);
  };

  const saveProduct = async () => {
    const payload = {
      name: form.name,
      slug: form.slug,
      category: form.category,
      price: parseInt(form.price) || 0,
      original_price: form.original_price ? parseInt(form.original_price) : null,
      discount: form.discount ? parseInt(form.discount) : null,
      brand: form.brand,
      image_url: form.image_url || null,
      in_stock: form.in_stock,
      has_gift: form.has_gift,
    };
    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) { toast({ title: "Lỗi cập nhật", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Đã cập nhật sản phẩm" });
    } else {
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
          </nav>
          <div className="mt-auto pt-8 space-y-2">
            <a href="/" className="flex items-center gap-2 text-sm hover:underline"><Home className="h-4 w-4" />Về trang chủ</a>
            <button onClick={signOut} className="flex items-center gap-2 text-sm hover:underline"><LogOut className="h-4 w-4" />Đăng xuất</button>
          </div>
        </aside>

        <main className="flex-1 p-6">
          {/* Mobile nav */}
          <div className="md:hidden flex gap-2 mb-4">
            <Button variant={tab === "products" ? "default" : "outline"} size="sm" onClick={() => setTab("products")}><Package className="h-4 w-4 mr-1" />Sản phẩm</Button>
            <Button variant={tab === "orders" ? "default" : "outline"} size="sm" onClick={() => setTab("orders")}><ShoppingBag className="h-4 w-4 mr-1" />Đơn hàng</Button>
            <a href="/" className="ml-auto"><Button variant="ghost" size="sm"><Home className="h-4 w-4" /></Button></a>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-foreground">Tên sản phẩm *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">Slug *</label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">Danh mục *</label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="den-pha, den-duong, den-lien-the, den-khan-cap" /></div>
                    <div><label className="text-sm font-medium text-foreground">Thương hiệu</label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">Giá (VND) *</label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">Giá gốc</label><Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">Giảm giá (%)</label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">URL hình ảnh</label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} />Còn hàng</label>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.has_gift} onChange={(e) => setForm({ ...form, has_gift: e.target.checked })} />Quà tặng</label>
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
                        <td className="p-3 font-medium text-foreground">{p.name}</td>
                        <td className="p-3 text-muted-foreground">{p.category}</td>
                        <td className="p-3 text-right text-accent font-bold">{formatPrice(p.price)}</td>
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
        </main>
      </div>
    </div>
  );
};

export default Admin;
