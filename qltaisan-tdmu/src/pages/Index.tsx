import ThemeToggle from '@/components/ThemeToggle';
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
        tone: "text-sky-400",
        path: "/bao-tri",
      },
      {
        title: "Kế hoạch bảo trì định kỳ",
        desc: "Lập và theo dõi kế hoạch theo chu kỳ.",
        icon: Wrench,
        tone: "text-violet-400",
        path: "/ke-hoach-bao-tri-dinh-ky",
      },
      {
        title: "Ghi nhận sự cố tài sản",
        desc: "Tạo sự cố, theo dõi trạng thái xử lý.",
        icon: AlertTriangle,
        tone: "text-orange-400",
        path: "/su-co-tai-san",
      },
      {
        title: "Phân công sửa chữa",
        desc: "Giao việc cho người sửa và quản lý tiến độ.",
        icon: UserCheck,
        tone: "text-emerald-400",
        path: "/phan-cong-sua-chua",
      },
      {
        title: "Lịch sử bảo trì",
        desc: "Lưu lịch sử sửa chữa, chi phí, kết quả.",
        icon: Clock,
        tone: "text-teal-400",
        path: "/lich-su-bao-tri",
      },
      {
        title: "Báo cáo thống kê",
        desc: "Thống kê, tổng hợp và xuất báo cáo.",
        icon: BarChart3,
        tone: "text-blue-400",
        path: "/thongke",
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">
                QLTS - TDMU
              </h1>
              <p className="text-sm text-zinc-500 truncate">
                Hệ thống Quản lý Tài sản tích hợp AI hỗ trợ bảo trì
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/assets")}
              className="hidden sm:inline-flex px-4 py-2 border border-zinc-700 hover:bg-zinc-900 rounded-2xl font-medium"
            >
              Danh sách tài sản
            </button>
            <button
              onClick={() => navigate("/bao-tri")}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-2xl font-medium"
            >
              Vào khu vực bảo trì
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 rounded-2xl font-medium"
            >
              Đăng nhập
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-14 sm:pt-20 pb-10 sm:pb-14 text-center">
        <h2 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
          XÂY DỰNG HỆ THỐNG QUẢN LÝ TÀI SẢN
          <br />
          <span className="text-blue-400">
            TÍCH HỢP AI HỖ TRỢ THÔNG TIN BẢO TRÌ TRONG TRƯỜNG
          </span>
        </h2>
        <p className="text-base sm:text-xl text-zinc-400 max-w-3xl mx-auto">
          Quản lý vòng đời tài sản • Ghi nhận sự cố • Lập kế hoạch bảo trì định kỳ
          • Phân công sửa chữa • Lịch sử & chi phí • Báo cáo thống kê • Trợ lý AI
          hỗ trợ tra cứu và gợi ý phương án xử lý.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => navigate("/bao-tri")}
            className="px-7 py-4 bg-blue-600 hover:bg-blue-700 rounded-3xl text-base sm:text-lg font-medium"
          >
            Truy cập Dashboard bảo trì
          </button>
          <button
            onClick={() => navigate("/ai-chat")}
            className="px-7 py-4 border border-zinc-700 hover:bg-zinc-900 rounded-3xl text-base sm:text-lg font-medium flex items-center justify-center gap-3"
          >
            <Bot className="w-5 h-5" /> Hỏi trợ lý AI
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-4xl mx-auto">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
            <p className="text-sm text-zinc-400">Mục tiêu</p>
            <p className="mt-1 font-semibold">
              Chuẩn hóa quy trình bảo trì – sửa chữa trong trường.
            </p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
            <p className="text-sm text-zinc-400">Trọng tâm</p>
            <p className="mt-1 font-semibold">
              Dữ liệu tập trung + theo dõi trạng thái theo thời gian.
            </p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
            <p className="text-sm text-zinc-400">AI hỗ trợ</p>
            <p className="mt-1 font-semibold">
              Tra cứu nhanh, gợi ý bước xử lý và tổng hợp thông tin.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="text-left">
            <h3 className="text-2xl font-semibold">Điều hướng nhanh</h3>
            <p className="text-zinc-500">
              Truy cập nhanh các phân hệ chính của đề tài.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="hidden sm:inline-flex px-4 py-2 border border-zinc-700 hover:bg-zinc-900 rounded-2xl font-medium"
          >
            Tổng quan hệ thống
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((x) => (
            <button
              key={x.title}
              onClick={() => navigate(x.path)}
              className="text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors rounded-3xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{x.title}</p>
                  <p className="text-sm text-zinc-400 mt-1">{x.desc}</p>
                </div>
                <x.icon className={`w-10 h-10 ${x.tone} shrink-0`} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-7 lg:col-span-2">
            <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-violet-400" /> Quy trình bảo trì
              – sửa chữa (gợi ý)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5">
                <p className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Ghi nhận sự cố
                </p>
                <p className="text-sm text-zinc-400 mt-2">
                  Tiếp nhận mô tả, mức độ, ngày xảy ra và trạng thái xử lý.
                </p>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5">
                <p className="font-semibold flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  Phân công sửa chữa
                </p>
                <p className="text-sm text-zinc-400 mt-2">
                  Giao việc cho nhân sự phù hợp, đặt hạn dự kiến hoàn thành.
                </p>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5">
                <p className="font-semibold flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-violet-400" />
                  Lập kế hoạch định kỳ
                </p>
                <p className="text-sm text-zinc-400 mt-2">
                  Thiết lập chu kỳ, người phụ trách, theo dõi thực hiện.
                </p>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5">
                <p className="font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Lưu lịch sử & chi phí
                </p>
                <p className="text-sm text-zinc-400 mt-2">
                  Ghi nhận kết quả, chi phí và phục vụ thống kê – báo cáo.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-7">
            <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-400" /> AI hỗ trợ bảo trì
            </h3>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-zinc-500">-</span>
                <span>
                  Tra cứu nhanh tài sản, sự cố, kế hoạch và lịch sử bảo trì.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-500">-</span>
                <span>
                  Tóm tắt dữ liệu và gợi ý checklist xử lý theo mô tả sự cố.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-500">-</span>
                <span>
                  Hỗ trợ ra quyết định: ưu tiên xử lý theo mức độ – rủi ro.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-500">-</span>
                <span>
                  Gợi ý báo cáo: tổng hợp số liệu theo tuần/tháng/quý.
                </span>
              </li>
            </ul>

            <button
              onClick={() => navigate("/ai-chat")}
              className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl font-medium flex items-center justify-center gap-2"
            >
              <Bot className="w-5 h-5" /> Mở AI Chat
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-7">
          <h3 className="text-2xl font-semibold mb-2">Phạm vi chức năng</h3>
          <p className="text-zinc-400 mb-6">
            Tập trung vào quản lý tài sản và mô-đun bảo trì/sửa chữa tích hợp AI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5">
              <p className="font-semibold">Quản lý tài sản</p>
              <p className="text-sm text-zinc-400 mt-2">
                Danh sách, tình trạng, phân loại, vị trí, phòng ban, nhà cung cấp.
              </p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5">
              <p className="font-semibold">Bảo trì – sửa chữa</p>
              <p className="text-sm text-zinc-400 mt-2">
                Kế hoạch định kỳ, sự cố, phân công, lịch sử, chi phí, trạng thái.
              </p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5">
              <p className="font-semibold">Báo cáo & AI</p>
              <p className="text-sm text-zinc-400 mt-2">
                Thống kê, xuất báo cáo và trợ lý AI phục vụ tra cứu/tổng hợp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center py-10 text-zinc-500 text-sm">
        © 2026 Hệ thống Quản lý Tài sản - Trường Đại học Thủ Dầu Một
      </footer>
    </div>
  );
}

export default Index;