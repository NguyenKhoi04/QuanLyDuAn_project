import { Building2 } from "lucide-react";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Tài liệu", href: "#" },
  { label: "Quy định", href: "#" }, // Rút ngắn tên để đỡ chiếm diện tích
  { label: "Giới thiệu", href: "#" },
  { label: "Quản lý tài sản", href: "#" },
  { label: "Báo cáo", href: "#" },
  { label: "Hỗ trợ", href: "#" },
  { label: "Liên hệ", href: "#" },
];

const AppHeader = () => {
  return (
    <header className="bg-blue-800 text-white shadow-md w-full">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Building2 className="h-8 w-8 text-blue-200" />
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">
              HỆ THỐNG QUẢN LÝ TÀI SẢN
            </h1>
            <p className="text-[11px] opacity-80 mt-1 uppercase tracking-wider">
              Trường Đại học Thủ Dầu Một
            </p>
          </div>
        </div>

        {/* Navbar */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="
                px-3 py-1.5 rounded-md
                text-[13px] font-medium 
                transition-all duration-200
                hover:bg-white/10
                active:bg-white/20
              "
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;