import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      toast({
        title: "Cấu hình Supabase chưa đúng",
        description: "Vui lòng kiểm tra VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY trên Vercel.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Đăng nhập thất bại", description: error.message, variant: "destructive" });
    } else {
      const userId = data.user?.id;

      // Nếu là admin thì đưa thẳng sang màn quản trị.
      if (userId) {
        const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
        if (isAdmin) {
          toast({ title: "Đăng nhập thành công (Admin)!" });
          navigate("/admin");
          return;
        }
      }

      toast({ title: "Đăng nhập thành công!" });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto bg-card rounded-lg border p-8">
          <h1 className="text-2xl font-bold text-foreground text-center mb-6">Đăng Nhập</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type={showPassword ? "text" : "password"} placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </form>
          <div className="text-center mt-4 space-y-2">
            <Link to="/forgot-password" className="block text-sm text-primary hover:underline font-medium">Quên mật khẩu?</Link>
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
