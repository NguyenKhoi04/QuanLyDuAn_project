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
      setUser(session?.user ?? null);
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

  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return `${firstName} ${lastName}`;
  };
  
  return (
    <aside className="w-65 bg-sidebar border-r border-sidebar-border flex flex-col min-h-0 h-full py-4 px-3 shrink-0 overflow-hidden">
      
      {/* Nút Đăng nhập / Đăng xuất */}
      {!user ? (
        <button
          className="shrink-0 w-full mx-auto bg-login-btn text-login-btn-foreground font-bold text-sm py-2 px-4 
          rounded-md border-2 border-login-btn mb-4 hover:opacity-90 transition-opacity shadow-sm"
          onClick={() => navigate("/login")}
        >
          Đăng nhập bằng tài khoản Google
        </button>
      ) : (
        <div className="mb-4 flex flex-col gap-2">
            <div className="px-3 py-3 bg-blue-50 border border-blue-100 rounded-md mb-1 shadow-sm">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Đã đăng nhập</p>
                
                {/* Hiển thị Họ và Tên từ Google Metadata */}

                {/* Sử dụng hàm formatFullName ở đây */}
                  <p className="text-sm font-bold text-slate-800 leading-tight">
                    {formatFullName(user.user_metadata?.full_name)}
                  </p>
                  
                  <p className="text-[11px] truncate text-slate-500 mt-0.5">
                    {user.email}
                  </p>


                {/* <p className="text-sm font-bold text-slate-800 leading-tight">
                  {user.user_metadata?.full_name || "Người dùng TDMU"}
                </p>
                
                {/* Hiển thị Email */}
                {/* <p className="text-[11px] truncate text-slate-500 mt-0.5">
                  {user.email}
                </p> */ }
            </div>
            
            <button
              className="shrink-0 w-full flex items-center justify-center gap-2 bg-white text-red-600 font-bold text-xs py-2 px-4 
              rounded-md border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
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
      <div className="shrink-0 p-4 mt-2 border-t border-sidebar-border bg-slate-100 flex items-center justify-center rounded-lg">
        <img
          src="/images/logo_DHTDMU.png"
          alt="Logo TDMU"
          className="w-auto h-auto max-w-[90%] max-h-[120px] object-contain opacity-90 hover:opacity-100 transition-all mx-auto"
        />
      </div>
    </aside>
  );
};

export default AppSidebar;