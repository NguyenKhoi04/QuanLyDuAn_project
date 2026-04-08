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
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

const SCROLL_STEP = 120;

const AppSidebar = () => {
// TODO: handle logout => navigate to login không được ở ngoài component này vì web trắng khi logout, nên để ở component Header hoặc App.tsx
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setCanScrollUp(scrollTop > 2);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 2);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = navRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState]);

  function scrollNav(dir: "up" | "down") {
    const el = navRef.current;
    if (!el) return;
    el.scrollBy({
      top: dir === "up" ? -SCROLL_STEP : SCROLL_STEP,
      behavior: "smooth",
    });
  }

  return (
    <aside className="w-65 bg-sidebar border-r border-sidebar-border flex flex-col min-h-0 h-full py-4 px-3 shrink-0 overflow-hidden">
      {/* Login button */}
      <button 
      className="shrink-0 w-full mx-auto bg-login-btn text-login-btn-foreground font-bold text-sm py-2 px-4 
      rounded-md border-2 border-login-btn mb-4 hover:opacity-90 transition-opacity shadow-sm" 
      onClick={() => navigate("/login")}>
        Đăng nhập bằng tài khoản Google
      </button>

      {/* Navigation: thanh cuộn dọc + nút kéo lên/xuống; chỉ vùng này cuộn trong sidebar */}
      <div className="flex min-h-0 flex-1 min-w-0 gap-0">
        <nav
          ref={navRef}
          onScroll={updateScrollState}
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-scroll overflow-x-hidden overscroll-y-contain py-1 pr-1 [scrollbar-gutter:stable]"
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
        
      </div>

      {/*  chen hình logo */}
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
