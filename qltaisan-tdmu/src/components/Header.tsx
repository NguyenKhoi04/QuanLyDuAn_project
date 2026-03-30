import { Building2 } from "lucide-react";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Tài liệu", href: "#" },
  { label: "Quy định quản lý sử dụng", href: "#" },
  // coi trong fb trang cá nhân của toy về "Thông báo quản lý và sử dụng phòng học"
  { label: "Giới thiệu", href: "#" },
  { label: "Quản lý tài sản", href: "#" },
  { label: "Báo cáo", href: "#" },
  { label: "Hỗ trợ", href: "#" },
  { label: "Liên hệ", href: "#" },
];

const AppHeader = () => {
  return (
    <header className="bg-blue-700 text-white shadow-lg">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Building2 className="h-10 w-10" />
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              HỆ THỐNG QUẢN LÝ TÀI SẢN
            </h1>
            <p className="text-sm opacity-90">
              Trường Đại học Thủ Dầu Một – TP.HCM
            </p>
          </div>
        </div>

        {/* Navbar */}
        <nav className="flex gap-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="
                px-4 py-2 rounded-lg
                text-lg font-semibold
                transition-all duration-200
                hover:bg-blue-500 hover:text-red-500
                active:bg-blue-400 active:text-red-600
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
