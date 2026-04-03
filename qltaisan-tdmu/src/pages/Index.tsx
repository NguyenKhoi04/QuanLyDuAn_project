import ThemeToggle from '../components/ThemeToggle';
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Clock,
  Shield,
  UserCheck,
  Wrench,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function Index() {
  const navigate = useNavigate();

  const quickLinks = useMemo(
    () => [
      {
        title: "Dashboard bảo trì",
        desc: "Tổng quan sự cố, kế hoạch, tiến độ sửa chữa.",
        icon: ClipboardCheck,
        tone: "text-sky-500", // Tăng độ đậm màu để nổi trên nền trắng
        path: "/bao-tri",
      },
      {
        title: "Kế hoạch bảo trì định kỳ",
        desc: "Lập và theo dõi kế hoạch theo chu kỳ.",
        icon: Wrench,
        tone: "text-violet-500",
        path: "/ke-hoach-bao-tri-dinh-ky",
      },
      {
        title: "Ghi nhận sự cố tài sản",
        desc: "Tạo sự cố, theo dõi trạng thái xử lý.",
        icon: AlertTriangle,
        tone: "text-orange-500",
        path: "/su-co-tai-san",
      },
      {
        title: "Phân công sửa chữa",
        desc: "Giao việc cho người sửa và quản lý tiến độ.",
        icon: UserCheck,
        tone: "text-emerald-500",
        path: "/phan-cong-sua-chua",
      },
      {
        title: "Lịch sử bảo trì",
        desc: "Lưu lịch sử sửa chữa, chi phí, kết quả.",
        icon: Clock,
        tone: "text-teal-500",
        path: "/lich-su-bao-tri",
      },
      {
        title: "Báo cáo thống kê",
        desc: "Thống kê, tổng hợp và xuất báo cáo.",
        icon: BarChart3,
        tone: "text-blue-500",
        path: "/thongke",
      },
    ],
    [],
  );

  return (
    /* Ép nền trắng rõ ràng */
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 truncate tracking-tight">
                QLTS - TDMU
              </h1>
              <p className="text-xs text-slate-500 truncate font-medium">
                Hệ thống Quản lý Tài sản • Thủ Dầu Một University
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/assets")}
              className="hidden md:inline-flex px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all"
            >
              Tài sản
            </button>
            <button
              onClick={() => navigate("/bao-tri")}
              className="px-5 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-100 transition-all"
            >
              Khu vực bảo trì
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <section className="pt-16 pb-12 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full border border-blue-100">
            Ứng dụng tích hợp Trợ lý AI thế hệ mới
          </div>
          <h2 className="text-4xl md:text-6xl font-black leading-tight mb-6 text-slate-900">
            HỆ THỐNG QUẢN LÝ TÀI SẢN
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              TÍCH HỢP AI BẢO TRÌ TDMU
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Nền tảng hiện đại giúp theo dõi vòng đời tài sản, tự động hóa quy trình sửa chữa và tối ưu hóa chi phí vận hành cho nhà trường.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate("/bao-tri")}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-bold shadow-xl transition-transform active:scale-95"
            >
              Bắt đầu quản lý
            </button>
            <button
              onClick={() => navigate("/ai-chat")}
              className="px-8 py-4 border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl text-lg font-bold flex items-center gap-3 transition-all"
            >
              <Bot className="w-6 h-6 text-blue-600" /> Trợ lý AI
            </button>
          </div>
        </section>

        <section className="py-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-extrabold text-slate-900">Tính năng cốt lõi</h3>
            <div className="h-px flex-1 bg-slate-200 mx-6 hidden sm:block"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((item) => (
              <button
                key={item.title}
                onClick={() => navigate(item.path)}
                className="group text-left bg-white border border-slate-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 rounded-[2rem] p-8 relative overflow-hidden"
              >
                <div className={`p-3 rounded-2xl bg-slate-50 inline-block mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-8 h-8 ${item.tone}`} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">→</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 mt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-200 rounded-md"></div>
          <span className="font-bold text-slate-800">TDMU ASSET</span>
        </div>
        <p className="text-slate-400 text-sm">
          © 2026 Quản lý Tài sản - Đại học Thủ Dầu Một. Phát triển bởi Đề tài NCKH.
        </p>
      </footer>
    </div>
  );
}

export default Index;