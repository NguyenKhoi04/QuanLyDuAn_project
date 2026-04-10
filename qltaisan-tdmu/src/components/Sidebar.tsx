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
      {
        label: "Kế hoạch định kỳ",
        icon: Wrench,
        path: "/ke-hoach-bao-tri-dinh-ky",
      },
      { label: "Sự cố", icon: AlertTriangle, path: "/su-co-tai-san" },
      { label: "Phân công", icon: UserCheck, path: "/phan-cong-sua-chua" },
      {
        label: "Sử dụng bảo trì",
        icon: ClipboardCheck,
        path: "/su-dung-bao-tri",
      },
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

const filterSidebar = (role: number) => {
  if (role === 1) return sidebarGroups;

  let allowed: string[] = [];

  if (role === 2) {
    allowed = [
      "/su-co-tai-san",
      "/assets",
      "/kiem-ke",
      "/vi-tri-tai-san",
      "/dieu-chuyen-tai-san",
    ];
  }

  if (role === 4) {
    allowed = [
      "/bao-tri",
      "/ke-hoach-bao-tri-dinh-ky",
      "/su-co-tai-san",
      "/phan-cong-sua-chua",
      "/lich-su-bao-tri",
    ];
  }

  // return sidebarGroups.map(group => ({
  //   ...group,
  //   links: group.links.filter(link => allowed.includes(link.path))
  // }));

  return sidebarGroups.map((group) => ({
    ...group,
    links: group.links.filter((link) => allowed.includes(link.path)),
  }));
};

const SCROLL_STEP = 120;

const AppSidebar = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Kiểm tra session Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // 2. Lấy dữ liệu từ DB dựa trên email session
        const { data: dbUser } = await supabase
          .from("nguoidung")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (dbUser) {
          setUser(dbUser);
          localStorage.setItem("user", JSON.stringify(dbUser));
        }
      } else {
        // Nếu không có session Supabase, dùng user từ localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      }

      setLoading(false);
    };

    initAuth();

    // Lắng nghe thay đổi login/logout từ Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        // Nếu đăng xuất bằng Supabase, xóa localStorage và reset user.
        if (event === "SIGNED_OUT") {
          localStorage.removeItem("user");
          setUser(null);
        } else {
          // Với đăng nhập thủ công không dùng Supabase session, giữ user từ localStorage.
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              localStorage.removeItem("user");
              setUser(null);
            }
          }
        }
      } else {
        initAuth(); // Re-fetch khi trạng thái thay đổi
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Thay vì dùng biến role từ localStorage cũ, dùng trực tiếp từ state user
  const role = user?.mavaitro || user?.MaVaiTro || user?.MaVaiRo || 0;
  const navigate = useNavigate();

  // useEffect(() => {
  //   const getSession = async () => {
  // const { data: { session } } = await supabase.auth.getSession();
  // const currentUser = session?.user ?? null;

  // setUser(currentUser);

  // if (currentUser) {
  //   const { error } = await supabase.from("NguoiDung").upsert({
  //     auth_id: currentUser.id,
  //     HoTen: currentUser.user_metadata?.full_name || "Người dùng",
  //     Email: currentUser.email,
  //     MaVaiTro: 1,
  //     TrangThai: 1
  //   }, {
  //     onConflict: 'auth_id'
  //   });

  //   if (error) {
  //     console.error("🔥 Lỗi lưu người dùng:", error);
  //   } else {
  //     console.log("✅ Đã lưu user vào DB");
  //   }
  // }

  //     // const { data: { subscription } } = supabase.auth.onAuthStateChange(
  //     //   async (_event, session) => {
  //     //     const currentUser = session?.user ?? null;
  //     //     setUser(currentUser);

  //     //     if (currentUser) {
  //     //       const { error } = await supabase.from("NguoiDung").upsert({
  //     //         MaNguoiDung: currentUser.id,
  //     //         HoTen: currentUser.user_metadata?.full_name || "Người dùng",
  //     //         Email: currentUser.email,
  //     //         MaVaiTro: 1,
  //     //         TrangThai: 1
  //     //       });

  //     //       if (error) {
  //     //         console.error("Lỗi lưu người dùng:", error.message);
  //     //       }
  //     //     }
  //     //   }
  //     // );

  // setLoading(false);
  //   };

  //   getSession();

  //   // Lắng nghe thay đổi trạng thái auth (login/logout)
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setUser(session?.user ?? null);
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
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
            <p className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter mb-1">
              Thành viên
            </p>

            <p className="text-sm font-bold text-slate-800 leading-tight break-words">
              {user?.hoten || user?.HoTen
                ? user?.hoten ?? user?.HoTen
                : formatFullName(user?.user_metadata?.full_name)}
            </p>

            <p className="text-[10px] truncate text-slate-500 mt-1 italic">
              {user?.email ?? user?.Email}
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
            {filterSidebar(role).map((group) => (
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
