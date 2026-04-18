import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";
import { resolveImageSrc } from "@/lib/image";

const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { config } = useSiteConfig();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceRequested, setInvoiceRequested] = useState(false);
  const [invoiceCompany, setInvoiceCompany] = useState("");
  const [invoiceTaxCode, setInvoiceTaxCode] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">{config.checkout_empty_cart_title || "Giỏ hàng trống"}</h1>
          <a href="/" className="text-primary hover:underline mt-4 inline-block">{config.checkout_continue_shopping_text || "Tiếp tục mua sắm"}</a>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: config.checkout_login_required_text || "Vui lòng đăng nhập để đặt hàng", variant: "destructive" });
      navigate("/login");
      return;
    }

    setLoading(true);

    const { data: order, error: orderError } = await supabase.from("orders").insert({
      user_id: user.id,
      total: totalPrice,
      full_name: fullName,
      phone,
      shipping_address: address,
      notes: notes || null,
      invoice_requested: invoiceRequested,
      invoice_company_name: invoiceRequested ? invoiceCompany : null,
      invoice_tax_code: invoiceRequested ? invoiceTaxCode : null,
      invoice_address: invoiceRequested ? invoiceAddress : null,
      invoice_email: invoiceRequested ? invoiceEmail : null,
    }).select().single();

    if (orderError || !order) {
      toast({ title: config.checkout_order_failed_text || "Đặt hàng thất bại", description: orderError?.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      toast({ title: config.checkout_items_failed_text || "Lỗi khi lưu chi tiết đơn hàng", description: itemsError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    clearCart();
    setLoading(false);
    toast({ title: config.checkout_success_title || "Đặt hàng thành công!", description: config.checkout_success_description || "Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất." });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">{config.checkout_title || "Thanh Toán"}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">{config.checkout_shipping_title || "Thông tin giao hàng"}</h2>
              <div className="space-y-4">
                <Input placeholder={config.checkout_fullname_placeholder || "Họ và tên *"} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <Input placeholder={config.checkout_phone_placeholder || "Số điện thoại *"} value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <Input placeholder={config.checkout_address_placeholder || "Địa chỉ giao hàng *"} value={address} onChange={(e) => setAddress(e.target.value)} required />
                <Textarea placeholder={config.checkout_notes_placeholder || "Ghi chú đơn hàng (tùy chọn)"} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            {/* Invoice section */}
            <div className="bg-card rounded-lg border p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={invoiceRequested} onChange={(e) => setInvoiceRequested(e.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{config.checkout_invoice_toggle_text || "Yêu cầu xuất hóa đơn VAT"}</span>
              </label>
              {invoiceRequested && (
                <div className="mt-4 space-y-4 pl-7">
                  <Input placeholder={config.checkout_invoice_company_placeholder || "Tên công ty *"} value={invoiceCompany} onChange={(e) => setInvoiceCompany(e.target.value)} required={invoiceRequested} />
                  <Input placeholder={config.checkout_invoice_tax_code_placeholder || "Mã số thuế *"} value={invoiceTaxCode} onChange={(e) => setInvoiceTaxCode(e.target.value)} required={invoiceRequested} />
                  <Input placeholder={config.checkout_invoice_address_placeholder || "Địa chỉ công ty *"} value={invoiceAddress} onChange={(e) => setInvoiceAddress(e.target.value)} required={invoiceRequested} />
                  <Input placeholder={config.checkout_invoice_email_placeholder || "Email nhận hóa đơn *"} type="email" value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} required={invoiceRequested} />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (config.checkout_loading_text || "Đang xử lý...") : (config.checkout_submit_text || "Xác nhận đặt hàng")}
            </Button>
          </form>

          {/* Order summary */}
          <div className="bg-card rounded-lg border p-6 h-fit sticky top-20">
            <h2 className="text-lg font-bold text-foreground mb-4">{config.checkout_summary_title || "Đơn hàng"} ({items.length} sản phẩm)</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={resolveImageSrc(item.image)} alt={item.name} className="w-14 h-14 object-contain bg-muted rounded p-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">{item.name}</p>
                    <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{config.checkout_summary_subtotal_text || "Tạm tính"}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{config.checkout_summary_shipping_text || "Phí vận chuyển"}</span>
                <span className="text-primary font-medium">{config.checkout_summary_shipping_free_text || "Miễn phí"}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>{config.checkout_summary_total_text || "Tổng cộng"}</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
