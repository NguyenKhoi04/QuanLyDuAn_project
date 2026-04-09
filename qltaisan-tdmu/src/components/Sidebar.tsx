import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  Settings,
  Users,
  FileText,
  HelpCircle,
  Wrench,
  AlertTriangle,
  UserCheck,
  Clock,
  MapPin,
  Move,
  ClipboardCheck,
  LogOut, // Import thêm icon LogOut
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient"; // Import supabase client

type SidebarLink = { label: string; icon: LucideIcon; path: string };
type SidebarGroup = { title: string; links: SidebarLink[] };

const sidebarGroups: SidebarGroup[] = [
  {
    title: "Tổng quan",
    links: [{ label: "Tổng quan", icon: LayoutDashboard, path: "/dashboard" }],
  },
  {
    title: "Tài sản",
    links: [
      { label: "Danh sách", icon: Package, path: "/assets" },
      { label: "Nhập / Xuất", icon: ClipboardList, path: "/nhap-xuat" },
      { label: "Kiểm kê", icon: FileText, path: "/kiem-ke" },
      { label: "Vị trí", icon: MapPin, path: "/vi-tri-tai-san" },
      { label: "Điều chuyển", icon: Move, path: "/dieu-chuyen-tai-san" },
    ],
  },
  {
    title: "Bảo trì",
    links: [
      { label: "Dashboard", icon: ClipboardCheck, path: "/bao-tri" },
      { label: "Kế hoạch định kỳ", icon: Wrench, path: "/ke-hoach-bao-tri-dinh-ky" },
      { label: "Sự cố", icon: AlertTriangle, path: "/su-co-tai-san" },
      { label: "Phân công", icon: UserCheck, path: "/phan-cong-sua-chua" },
      { label: "Sử dụng bảo trì", icon: ClipboardCheck, path: "/su-dung-bao-tri" },
      { label: "Lịch sử", icon: Clock, path: "/lich-su-bao-tri" },
    ],
  },
  {
    title: "Hệ thống",
    links: [
      { label: "Thống kê", icon: BarChart3, path: "/thongke" },
      { label: "Người dùng", icon: Users, path: "/users" },
      { label: "Cài đặt", icon: Settings, path: "/settings" },
      { label: "Trợ giúp", icon: HelpCircle, path: "/help" },
    ],
  },
];

const SCROLL_STEP = 120;

const AppSidebar = () => {
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const [user, setUser] = useState<any>(null); // Lưu thông tin user
  const [loading, setLoading] = useState(true);

  // 1. Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      // 👉 Nếu đã đăng nhập thì lưu vào bảng NguoiDung
      if (currentUser) {
        const { error } = await supabase.from("nguoidung").upsert({
          auth_id: user.id,
          HoTen: user.user_metadata?.full_name || "Người dùng",
          Email: user.email,
          MaVaiTro: 1,
          TrangThai: 1
        }, {
          onConflict: 'auth_id'
        });

        if (error) {
          console.error("Lỗi lưu người dùng:", error.message);
        }
      }

      // const { data: { subscription } } = supabase.auth.onAuthStateChange(
      //   async (_event, session) => {
      //     const currentUser = session?.user ?? null;
      //     setUser(currentUser);

      //     if (currentUser) {
      //       const { error } = await supabase.from("NguoiDung").upsert({
      //         MaNguoiDung: currentUser.id,
      //         HoTen: currentUser.user_metadata?.full_name || "Người dùng",
      //         Email: currentUser.email,
      //         MaVaiTro: 1,
      //         TrangThai: 1
      //       });

      //       if (error) {
      //         console.error("Lỗi lưu người dùng:", error.message);
      //       }
      //     }
      //   }
      // );

  setLoading(false);
    };

    getSession();

    // Lắng nghe thay đổi trạng thái auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const updateScrollState = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    // ... logic scroll giữ nguyên
  }, []);

  if (loading) return <aside className="w-65 bg-sidebar border-r h-full" />;

  const formatFullName = (fullName: string | undefined) => {
  if (!fullName) return "Người dùng TDMU";
  
  const parts = fullName.trim().split(" ");
  if (parts.length < 2) return fullName;

  // Lấy từ cuối cùng làm Tên (firstName)
  const firstName = parts[parts.length - 1];
  // Lấy các từ còn lại làm Họ và chữ lót (lastName)
  const lastName = parts.slice(0, parts.length - 1).join(" ");
  
  // Trả về định dạng: Họ và tên lót + Tên
  return `${lastName} ${firstName}`;
};
  
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col min-h-0 h-full py-4 px-3 shrink-0 overflow-hidden">
  
        {!user ? (
          <button
            className="shrink-0 w-full mx-auto bg-login-btn text-login-btn-foreground font-bold text-xs py-2.5 px-4 
            rounded-md border-2 border-login-btn mb-4 hover:opacity-90 transition-opacity shadow-sm"
            onClick={() => navigate("/login")}
          >
            Đăng nhập bằng tài khoản Google
          </button>
        ) : (
          <div className="mb-4 flex flex-col gap-2 w-full">
              {/* Ô thông tin: Dùng w-full nhưng thêm padding và căn chỉnh text */}
              <div className="px-3 py-3 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                  <p className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter mb-1">Thành viên</p>
                  
                  <p className="text-sm font-bold text-slate-800 leading-tight break-words">
                    {formatFullName(user.user_metadata?.full_name)}
                  </p>
                  
                  <p className="text-[10px] truncate text-slate-500 mt-1 italic">
                    {user.email}
                  </p>
              </div>
              
              <button
                className="w-full flex items-center justify-center gap-2 bg-white text-red-600 font-bold text-[11px] py-1.5 px-3 
                rounded-md border border-red-200 hover:bg-red-50 transition-all shadow-sm"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Đăng xuất
              </button>
          </div>
        )}

      {/* Navigation: Chỉ hiển thị khi đã đăng nhập */}
      <div className="flex min-h-0 flex-1 min-w-0 gap-0">
        {user ? (
          <nav
            ref={navRef}
            onScroll={updateScrollState}
            className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden py-1 pr-1"
          >
            {sidebarGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
                {group.links.map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground hover:text-link-hover hover:bg-sidebar-accent transition-colors group text-left"
                  >
                    <link.icon className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-link-hover transition-colors" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-muted-foreground italic">
              Vui lòng đăng nhập để xem các chức năng hệ thống.
            </p>
          </div>
        )}
      </div>

      {/* Logo TDMU */}
      <div className="shrink-0 p-2 mt-auto border-t border-sidebar-border flex items-center justify-center">
        <div className="bg-white/50 p-2 rounded-lg w-full flex justify-center">
            <img
              src="/images/logo_DHTDMU.png"
              alt="Logo TDMU"
              className="w-full h-auto max-w-[140px] object-contain mix-blend-multiply" 
            />
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;