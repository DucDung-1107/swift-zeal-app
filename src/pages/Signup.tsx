import { useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { config } = useSiteConfig();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      toast({
        title: "Cấu hình Supabase chưa đúng",
        description: "Vui lòng kiểm tra VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY trên Vercel.",
        variant: "destructive",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const normalizedFullName = fullName.trim();

    if (normalizedPassword.length < 6) {
      toast({ title: "Mật khẩu phải có ít nhất 6 ký tự", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: normalizedPassword,
      options: {
        data: { full_name: normalizedFullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Đăng ký thất bại", description: error.message, variant: "destructive" });
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
            <h1 className="text-2xl font-bold text-foreground mb-2">{config.signup_check_email_title || "Kiểm tra email của bạn"}</h1>
            <p className="text-muted-foreground">{config.signup_check_email_description || "Chúng tôi đã gửi email xác nhận tới"} <strong>{email}</strong>. Vui lòng kiểm tra và xác nhận để hoàn tất đăng ký.</p>
            <Link to="/login" className="inline-block mt-6 text-primary hover:underline font-medium">{config.signup_back_to_login_text || "Quay lại đăng nhập"}</Link>
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
          <h1 className="text-2xl font-bold text-foreground text-center mb-6">{config.signup_title || "Đăng Ký"}</h1>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder={config.signup_fullname_placeholder || "Họ và tên"} value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder={config.signup_email_placeholder || "Email"} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type={showPassword ? "text" : "password"} placeholder={config.signup_password_placeholder || "Mật khẩu (ít nhất 6 ký tự)"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (config.signup_loading_text || "Đang đăng ký...") : (config.signup_submit_text || "Đăng Ký")}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {config.signup_login_prompt_text || "Đã có tài khoản?"}{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">{config.signup_login_link_text || "Đăng nhập"}</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
