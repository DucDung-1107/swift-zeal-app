import { useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast({ title: "Lỗi cấu hình", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Gửi email thất bại", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-md mx-auto bg-card rounded-lg border p-8 text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Kiểm tra email</h1>
            <p className="text-muted-foreground">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu tới <strong>{email}</strong>. Vui lòng kiểm tra hộp thư.
            </p>
            <Link to="/login" className="inline-block mt-6 text-primary hover:underline font-medium">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto bg-card rounded-lg border p-8">
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">Quên mật khẩu</h1>
          <p className="text-center text-muted-foreground mb-6">
            Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
            </Button>
          </form>
          <Link to="/login" className="flex items-center justify-center gap-1 mt-4 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
