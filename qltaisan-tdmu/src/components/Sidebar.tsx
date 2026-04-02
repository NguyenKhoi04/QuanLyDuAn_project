
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
  ClipboardCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const sidebarLinks = [
  { label: "Tổng quan", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Danh sách tài sản", icon: Package, path: "/assets" },
  { label: "Nhập/Xuất tài sản", icon: ClipboardList, path: "/nhap-xuat" },
  { label: "Kiểm kê", icon: FileText, path: "/KiemKe" },
  { label: "Dashboard bảo trì", icon: ClipboardCheck, path: "/bao-tri" },
  {
    label: "Kế hoạch bảo trì định kỳ",
    icon: Wrench,
    path: "/ke-hoach-bao-tri-dinh-ky",
  },
  { label: "Sự cố tài sản", icon: AlertTriangle, path: "/su-co-tai-san" },
  { label: "Phân công sửa chữa", icon: UserCheck, path: "/phan-cong-sua-chua" },
  { label: "Lịch sử bảo trì", icon: Clock, path: "/lich-su-bao-tri" },
  { label: "Báo cáo thống kê", icon: BarChart3, path: "/thongke" },
  { label: "Quản lý người dùng", icon: Users, path: "/users" },
  { label: "Cài đặt hệ thống", icon: Settings, path: "/settings" },
  { label: "Trợ giúp", icon: HelpCircle, path: "/help" },
];


const AppSidebar = () => {
// TODO: handle logout => navigate to login không được ở ngoài component này vì web trắng khi logout, nên để ở component Header hoặc App.tsx
  const navigate = useNavigate();
  return (
    <aside className="w-65 bg-sidebar border-r border-sidebar-border flex flex-col py-4 px-3 shrink-0">
      {/* Login button */}
      <button 
      className="w-full mx-auto bg-login-btn text-login-btn-foreground font-bold text-sm py-2 px-4 
      rounded-md border-2 border-login-btn mb-6 hover:opacity-90 transition-opacity shadow-sm" 
      onClick={() => navigate("/login")}>
        Đăng nhập bằng tài khoản Google
      </button>

      {/* Navigation links */}
      <nav className="flex flex-col gap-1">
        {sidebarLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => navigate(link.path)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground hover:text-link-hover hover:bg-sidebar-accent transition-colors group text-left"
          >
            <link.icon className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-link-hover transition-colors" />
            <span className="text-sm font-medium">{link.label}</span>
          </button>
        ))}
      </nav>

      {/*  chen hình logo */}
      <div className="mt-auto pt-4 border-t border-sidebar-border">
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
