import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronDown, ChevronUp } from "lucide-react";

const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Chờ xác nhận", variant: "outline" },
  confirmed: { label: "Đã xác nhận", variant: "secondary" },
  shipping: { label: "Đang giao", variant: "default" },
  delivered: { label: "Đã giao", variant: "default" },
  cancelled: { label: "Đã hủy", variant: "destructive" },
};

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  full_name: string;
  phone: string;
  shipping_address: string;
  invoice_requested: boolean;
  notes: string | null;
}

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const toggleExpand = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    if (!orderItems[orderId]) {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      setOrderItems((prev) => ({ ...prev, [orderId]: (data as OrderItem[]) || [] }));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-20 text-center text-muted-foreground">Đang tải...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" /> Đơn hàng của tôi
        </h1>

        {orders.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Bạn chưa có đơn hàng nào</p>
            <a href="/" className="inline-block mt-4 text-primary hover:underline font-medium">Mua sắm ngay</a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const st = statusMap[order.status] || { label: order.status, variant: "outline" as const };
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} className="bg-card rounded-lg border overflow-hidden">
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Mã đơn</p>
                        <p className="text-sm font-medium text-foreground">{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ngày đặt</p>
                        <p className="text-sm text-foreground">{new Date(order.created_at).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tổng tiền</p>
                        <p className="text-sm font-bold text-primary">{formatPrice(order.total)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Trạng thái</p>
                        <Badge variant={st.variant} className="mt-0.5">{st.label}</Badge>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground ml-2" /> : <ChevronDown className="h-5 w-5 text-muted-foreground ml-2" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t p-4 bg-muted/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Người nhận</p>
                          <p className="text-sm text-foreground">{order.full_name} - {order.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Địa chỉ</p>
                          <p className="text-sm text-foreground">{order.shipping_address}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phương thức thanh toán</p>
                          <p className="text-sm text-foreground">Thanh toán khi nhận hàng (COD)</p>
                        </div>
                        {order.invoice_requested && (
                          <div>
                            <p className="text-xs text-muted-foreground">Hóa đơn VAT</p>
                            <Badge variant="outline">Đã yêu cầu</Badge>
                          </div>
                        )}
                        {order.notes && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-muted-foreground">Ghi chú</p>
                            <p className="text-sm text-foreground">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      <p className="text-sm font-medium text-foreground mb-2">Chi tiết sản phẩm</p>
                      {orderItems[order.id] ? (
                        <div className="space-y-2">
                          {orderItems[order.id].map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-foreground">{item.product_name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                              <span className="font-medium text-foreground">{formatPrice(item.product_price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Đang tải...</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyOrders;
