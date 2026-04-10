import { useEffect, useState } from "react";
import { Building2, Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/Header";
import { supabase } from "@/lib/supabaseClient";
// Đường dẫn tùy vào dự án của bạn với file supabaseClient.ts

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setError("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Tham số "hd" yêu cầu Google chỉ hiển thị/chấp nhận tài khoản thuộc domain này
          queryParams: {
            hd: "student.tdmu.edu.vn",
            prompt: "select_account",
          },
          // URL quay lại sau khi đăng nhập thành công (khai báo trong Supabase)
          redirectTo: window.location.origin + "/dashboard",
          //redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError("Lỗi đăng nhập Google: " + err.message);
    }
  };



  const handleLogin = async () => {
  try {
    setError("");
    setLoading(true);

    const { data, error } = await supabase
      .from("NguoiDung")
      .select("*")
      .eq("TenDangNhap", username)
      .eq("MatKhau", password);

    if (error || !data || data.length === 0) {
      setError("Sai tài khoản hoặc mật khẩu!");
      setLoading(false);
      return;
    }

const userData = data[0];

    // 👉 Lưu user vào localStorage (hoặc state global)
    localStorage.setItem("user", JSON.stringify(data));

    // 👉 Phân quyền điều hướng
    const role = data.MaVaiTro;

    if (role === 1) {
      navigate("/dashboard"); // Admin
    } else if (role === 2) {
      navigate("/assets"); // Nhân viên quản lý tài sản
    } else if (role === 4) {
      navigate("/bao-tri"); // Kỹ thuật viên
    } else {
      setError("Bạn không có quyền truy cập hệ thống!");
    }

  } catch (err: any) {
    setError("Lỗi: " + err.message);
  } finally {
    setLoading(false);
  }
};

  // Cần một useEffect để kiểm tra domain sau khi redirect về (Double Check)
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email;
        if (!email?.endsWith("@student.tdmu.edu.vn")) {
          // Nếu lọt lưới, thực hiện đăng xuất ngay lập tức
          await supabase.auth.signOut();
          setError("Chỉ chấp nhận tài khoản email @student.tdmu.edu.vn");
        } else {
          navigate("/dashboard");
        }
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div>
      <AppHeader />

      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <div className="w-full max-w-md mx-4 bg-background/80 backdrop-blur-md border border-border rounded-xl shadow-xl p-8">
          {/* Logo / Title */}
          <div className="flex flex-col items-center gap-2 mb-4">
            {/* <Building2 className="h-10 w-10 text-primary" /> */}
            <img
              src="/images/logo-tdmu.png"
              alt="Logo Trường Đại học Thủ Dầu Một"
              className="w-48 h-24 object-contain"
            />
            <h1 className="text-xl font-bold text-center text-foreground tracking-tight">
              HỆ THỐNG QUẢN LÝ TÀI SẢN
            </h1>
            <p className="text-xs text-muted-foreground">
              Trường Đại học Thủ Dầu Một – TP.HCM
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center mb-6">
            Bạn hãy đăng nhập trước khi vào chức năng
          </p>

          {/* Error message */}
          {error && (
            <p className="text-xs text-destructive text-center mb-4 font-medium">
              {error}
            </p>
          )}

          {/* <form
            onSubmit={(e) => e.preventDefault(); handleLogin(); }
            className="flex flex-col gap-4" }
          > */}

          <form  className="flex flex-col gap-4"
          onSubmit={(e) => { e.preventDefault();
             handleLogin();
}}
>
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Tên người dùng</Label>
              <Input
                id="username"
                placeholder="Nhập tên người dùng"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Nhớ mật khẩu
              </Label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md 
                        hover:bg-blue-700 transition-colors shadow-sm"
            >
              Đăng nhập
            </button>

            {/* Google login button */}
            {/* <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-red-600 text-white font-semibold py-2.5 rounded-md 
                        hover:bg-red-700 transition-colors shadow-sm"
            >
            Đăng nhập bằng tài khoản Google
            </button> */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full bg-red-600 text-white font-semibold py-2.5 rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? "Đang kết nối..." : "Đăng nhập bằng tài khoản Google"}
            </button>
          </form>

          {/* Forgot password */}
          {/* Bottom Links: Quên mật khẩu & Quay lại */}
          <div className="mt-8 pt-6 border-t border-border/50 flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="text-muted-foreground hover:text-red-600 transition-colors flex items-center gap-1.5 group"
              >
                <span className="p-1.5 bg-secondary rounded-md group-hover:bg-red-50 transition-colors">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                Quên mật khẩu?
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
              >
                <span className="p-1.5 bg-secondary rounded-md group-hover:bg-primary/10 transition-colors">
                  <Building2 className="w-3.5 h-3.5" />
                </span>
                Quay lại trang chủ
                
              </button>
            </div>

            <p className="text-[11px] text-center text-muted-foreground/60 italic">
              Hỗ trợ kỹ thuật: Viện Công nghệ số- Trường Đại học Thủ Dầu Một
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
