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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const AppSidebar = () => {
// TODO: handle logout => navigate to login không được ở ngoài component này vì web trắng khi logout, nên để ở component Header hoặc App.tsx
  const navigate = useNavigate();
  return (
    <aside className="w-65 bg-sidebar border-r border-sidebar-border flex flex-col min-h-0 py-4 px-3 shrink-0">
      {/* Login button */}
      <button 
      className="shrink-0 w-full mx-auto bg-login-btn text-login-btn-foreground font-bold text-sm py-2 px-4 
      rounded-md border-2 border-login-btn mb-4 hover:opacity-90 transition-opacity shadow-sm" 
      onClick={() => navigate("/login")}>
        Đăng nhập bằng tài khoản Google
      </button>

      {/* Navigation: cuộn trong sidebar, nhấp điều hướng như cũ */}
      <nav
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain pr-1 -mr-1 flex flex-col gap-4"
        aria-label="Điều hướng chính"
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

      {/*  chen hình logo */}
      <div className="shrink-0 pt-4 mt-2 border-t border-sidebar-border">
        <img
          src="/images/logo_DHTDMU.png"
          alt="Logo TDMU"
          className="w-49 h-28 object-contain mx-auto opacity-90 hover:opacity-100 transition-all"
        />
      </div>
    </aside>
  );
};

export default AppSidebar;
