import { Building2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationSystem from "./NotificationSystem";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Tài liệu", href: "#" },
  { label: "Quy định", href: "#" },
  { label: "Giới thiệu", href: "#" },
  { label: "Quản lý tài sản", href: "#" },
  { label: "Báo cáo", href: "#" },
  { label: "Hỗ trợ", href: "#" },
  { label: "Liên hệ", href: "#" },
];

const AppHeader = () => {
  return (
    <header className="shrink-0 z-30 bg-blue-800 text-white shadow-md w-full">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Building2 className="h-9 w-9 text-blue-200" />
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">
              HỆ THỐNG QUẢN LÝ TÀI SẢN
            </h1>
            <p className="text-[12px] opacity-85 font-medium uppercase tracking-wide">
              Trường Đại học Thủ Dầu Một
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {/* Navbar */}
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="
                  px-4 py-2 rounded-md
                  text-[15px] font-semibold  /* Chữ 15px và đậm hơn một chút để dễ đọc */
                  transition-all duration-200
                  hover:bg-white/15          /* Hiệu ứng hover rõ hơn */
                  hover:text-blue-100       /* Đổi màu nhẹ khi hover thay vì đỏ chói */
                  active:bg-white/25
                "
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;