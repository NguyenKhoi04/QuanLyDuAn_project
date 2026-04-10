import ThemeToggle from '../components/ThemeToggle';
import {
  AlertTriangle, BarChart3, Bot, Calendar, CheckCircle, ClipboardCheck,
  Clock, Shield, UserCheck, Wrench, MapPin, Move, ChevronRight,
  Mail, LogOut, User
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";   // ← Quan trọng

function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ==================== KIỂM TRA ĐĂNG NHẬP ====================
  useEffect(() => {
    const initAuth = async () => {
      // 1. Kiểm tra session Supabase (Google Login)
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: dbUser } = await supabase
          .from("nguoidung")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (dbUser) {
          setUser(dbUser);
          localStorage.setItem("user", JSON.stringify(dbUser));
        }
      } 
      // 2. Nếu không có session Supabase → kiểm tra localStorage (Đăng nhập thường)
      else {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    // Lắng nghe thay đổi (logout, login Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      initAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // ==================== QUICK LINKS ====================
  const quickLinks = useMemo(() => [ /* ... giữ nguyên */ ], []);

  return (
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

            {/* ==================== NÚT ĐĂNG NHẬP / TÀI KHOẢN ==================== */}
            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  <div 
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-2xl cursor-pointer transition-all"
                  >
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[160px]">
                      {user.hoten || "Người dùng"}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="px-5 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-2xl font-medium transition-colors"
                >
                  Đăng nhập
                </button>
              )
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <section className="pt-16 pb-12 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full border border-blue-100">
            Ứng dụng tích hợp Trợ lý AI thế hệ mới
          </div>
          <h2 className="leading-tight mb-6 text-slate-900">
              {/* Chữ trên: Giữ cỡ To (6xl) */}
              <span className="block text-4xl md:text-6xl font-black mb-2">
                HỆ THỐNG QUẢN LÝ TÀI SẢN
              </span>
              
              {/* Chữ dưới: Giảm xuống cỡ Vừa (3xl) */}
              <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-wide">
                TÍCH HỢP AI HỖ TRỢ BẢO TRÌ TDMU
              </span>
            </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Nền tảng hiện đại giúp theo dõi vòng đời tài sản, tự động hóa quy trình sửa chữa và tối ưu hóa chi phí vận hành cho nhà trường.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate("/dashboard")}
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
          <div className="flex flex-col mb-10">
              <div className="flex items-center gap-6 mb-2">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                  Điều hướng nhanh - <span className="text-blue-600">Tính năng cốt lõi</span>
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent hidden sm:block"></div>
              </div>
              
              <h5 className="text-sm md:text-base text-slate-500 font-medium whitespace-nowrap">
                Truy cập nhanh các phân hệ chính của hệ thống quản lý tài sản
              </h5>
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

        {/* --- BỔ SUNG VÀO SAU SECTION ĐIỀU HƯỚNG NHANH --- */}

      {/* Section: Tại sao chọn TDMU Asset? (Lợi ích cốt lõi) */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-100">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-black text-slate-900 mb-4">Giá trị hệ thống mang lại</h3>
          <p className="text-slate-500 max-w-2xl mx-auto">Tối ưu hóa nguồn lực và thời gian thông qua quy trình tự động hóa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-5 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Giảm 40% thời gian phản hồi</h4>
              <p className="text-sm text-slate-500 leading-relaxed">AI tự động phân loại sự cố và gửi thông báo trực tiếp đến bộ phận kỹ thuật có chuyên môn phù hợp.</p>
            </div>
          </div>

          <div className="flex gap-5 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Dữ liệu chính xác 100%</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Mọi lịch sử bảo trì và thay thế linh kiện được lưu trữ vĩnh viễn, minh bạch, hỗ trợ tốt cho công tác kiểm kê.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Trạng thái hệ thống thực tế (Stats) */}
      <section className="max-w-7xl mx-auto px-6 py-12 mb-16">
        <div className="bg-indigo-600 rounded-[3rem] p-10 md:p-16 text-white overflow-hidden relative">
          {/* Decor nền */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-black mb-2">1,200+</p>
              <p className="text-indigo-100 text-sm font-medium">Tài sản quản lý</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black mb-2">85%</p>
              <p className="text-indigo-100 text-sm font-medium">Bảo trì định kỳ</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black mb-2">24/7</p>
              <p className="text-indigo-100 text-sm font-medium">AI Hỗ trợ</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black mb-2">150+</p>
              <p className="text-indigo-100 text-sm font-medium">Cán bộ vận hành</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Quy trình AI (Workflow) */}
      <section className="max-w-7xl mx-auto px-6 py-10 mb-20">
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Bot className="w-8 h-8 text-blue-400" />
                Luồng xử lý thông minh
              </h3>
              <p className="text-slate-400">Cách trợ lý AI hỗ trợ bạn trong công việc hàng ngày.</p>
            </div>
            <button 
              onClick={() => navigate("/ai-chat")}
              className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-blue-50 transition-colors"
            >
              Thử nghiệm ngay
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
              <span className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">1</span>
              <h5 className="font-bold mb-3 mt-2">Tiếp nhận thông tin</h5>
              <p className="text-sm text-slate-400">Bạn chỉ cần nhập mô tả sự cố bằng ngôn ngữ tự nhiên (ví dụ: "Máy chiếu phòng C102 không lên nguồn").</p>
            </div>
            <div className="relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
              <span className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">2</span>
              <h5 className="font-bold mb-3 mt-2">Phân tích & Gợi ý</h5>
              <p className="text-sm text-slate-400">AI truy xuất lịch sử thiết bị và gợi ý các bước kiểm tra sơ bộ hoặc đề xuất nhân sự sửa chữa phù hợp nhất.</p>
            </div>
            <div className="relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
              <span className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">3</span>
              <h5 className="font-bold mb-3 mt-2">Hoàn tất báo cáo</h5>
              <p className="text-sm text-slate-400">Tự động tổng hợp dữ liệu thành báo cáo chi tiết sau khi sự cố được khắc phục để lưu trữ vào lịch sử.</p>
            </div>
          </div>
        </div>
      </section>


              {/* --- PHẦN QUY TRÌNH & AI HỖ TRỢ --- */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Khối: Quy trình bảo trì - sửa chữa */}
            <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-zinc-900">
                <Calendar className="w-6 h-6 text-violet-500" />
                Quy trình bảo trì – sửa chữa (gợi ý)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bước 1 */}
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:bg-white hover:shadow-md transition-all">
                  <p className="font-bold flex items-center gap-2 text-zinc-800">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Ghi nhận sự cố
                  </p>
                  <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                    Tiếp nhận mô tả, mức độ, ngày xảy ra và trạng thái xử lý ban đầu.
                  </p>
                </div>

                {/* Bước 2 */}
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:bg-white hover:shadow-md transition-all">
                  <p className="font-bold flex items-center gap-2 text-zinc-800">
                    <UserCheck className="w-5 h-5 text-blue-500" />
                    Phân công sửa chữa
                  </p>
                  <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                    Giao việc cho nhân sự phù hợp, đặt hạn dự kiến hoàn thành công việc.
                  </p>
                </div>

                {/* Bước 3 */}
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:bg-white hover:shadow-md transition-all">
                  <p className="font-bold flex items-center gap-2 text-zinc-800">
                    <Wrench className="w-5 h-5 text-violet-500" />
                    Lập kế hoạch định kỳ
                  </p>
                  <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                    Thiết lập chu kỳ bảo dưỡng, người phụ trách và theo dõi thực hiện.
                  </p>
                </div>

                {/* Bước 4 */}
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:bg-white hover:shadow-md transition-all">
                  <p className="font-bold flex items-center gap-2 text-zinc-800">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Lưu lịch sử & chi phí
                  </p>
                  <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                    Ghi nhận kết quả, chi phí và phục vụ công tác thống kê – báo cáo.
                  </p>
                </div>
              </div>
            </div>

            {/* Khối: AI hỗ trợ bảo trì */}
            <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-zinc-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Bot className="w-24 h-24" />
              </div>
              
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
                <Bot className="w-6 h-6 text-blue-400" />
                AI hỗ trợ bảo trì
              </h3>
              
              <ul className="space-y-4 text-zinc-400 text-sm relative z-10 mb-8">
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  Tra cứu nhanh tài sản, sự cố, kế hoạch và lịch sử bảo trì.
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  Tóm tắt dữ liệu và gợi ý checklist xử lý theo mô tả sự cố.
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  Hỗ trợ ra quyết định: ưu tiên xử lý theo mức độ – rủi ro.
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  Gợi ý báo cáo: tổng hợp số liệu theo tuần/tháng/quý.
                </li>
              </ul>

              <button 
                onClick={() => navigate("/ai-chat")}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Bot className="w-5 h-5" /> Mở AI Chat
              </button>
            </div>
          </div>
        </section>

        {/* --- PHẦN PHẠM VI CHỨC NĂNG --- */}
        <section className="max-w-7xl mx-auto px-6 py-12 mb-12">
          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm">
            <div className="mb-10">
              <h3 className="text-2xl font-black text-zinc-900 mb-2">Phạm vi chức năng</h3>
              <p className="text-zinc-500">Tập trung vào quản lý tài sản và mô-đun bảo trì/sửa chữa tích hợp AI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Chức năng 1 */}
              <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-blue-200 transition-colors">
                <h4 className="font-bold text-zinc-900 mb-3">Quản lý tài sản</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Danh sách, tình trạng, phân loại, vị trí, phòng ban, nhà cung cấp.
                </p>
              </div>

              {/* Chức năng 2 */}
              <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-blue-200 transition-colors">
                <h4 className="font-bold text-zinc-900 mb-3">Bảo trì – sửa chữa</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Kế hoạch định kỳ, sự cố, phân công, lịch sử, chi phí, trạng thái.
                </p>
              </div>

              {/* Chức năng 3 */}
              <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-blue-200 transition-colors">
                <h4 className="font-bold text-zinc-900 mb-3">Báo cáo & AI</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Thống kê, xuất báo cáo và trợ lý AI phục vụ tra cứu/tổng hợp dữ liệu.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

          <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Cột 1: Thương hiệu & Giới thiệu */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">QLTS -Tài sản TDMU  -Tài sản hệ thống</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Hệ thống quản lý tài sản thông minh tích hợp trợ lý ảo AI, tối ưu hóa quy trình bảo trì và vận hành tại Đại học Thủ Dầu Một.
            </p>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Hệ thống</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li><button onClick={() => navigate("/assets")} className="hover:text-blue-600 transition-colors">Danh mục tài sản</button></li>
              <li><button onClick={() => navigate("/bao-tri")} className="hover:text-blue-600 transition-colors">Khu vực bảo trì</button></li>
              <li><button onClick={() => navigate("/ai-chat")} className="hover:text-blue-600 transition-colors">Trợ lý ảo AI</button></li>
              <li><button onClick={() => navigate("/thongke")} className="hover:text-blue-600 transition-colors">Báo cáo thống kê</button></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Hỗ trợ</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Quy trình bảo trì</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Báo cáo sự cố</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ trực tiếp */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Liên hệ</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Số 06, Trần Văn Ơn, Phú Lợi, Thành phố Hồ Chí Minh.</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                <span>it@tdmu.edu.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng bản quyền dưới cùng */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs italic">
             © 2026 Hệ thống Quản lý Tài sản - Trường Đại học Thủ Dầu Một | Phát triển bởi Viện CNTT & CDS | Bản quyền thuộc về Đại học Thủ Dầu Một. Mọi quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
            <span>Phiên bản v2.0.4</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Hệ thống trực tuyến</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
{/* 
      <footer className="max-w-7xl mx-auto px-6 py-12 mt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-200 rounded-md"></div>
          <span className="font-bold text-slate-800">Quản lý Tài sản - Đại học Thủ Dầu Một</span>
        </div>
        <p className="text-slate-400 text-sm">
          © 2026 Quản lý Tài sản - Đại học Thủ Dầu Một.
        </p>
      </footer> */}
    </div>
  );
}

export default Index;



// import ThemeToggle from '../components/ThemeToggle';
// import {
//   AlertTriangle,
//   BarChart3,
//   Bot,
//   Calendar,
//   CheckCircle,
//   ClipboardCheck,
//   Clock,
//   Shield,
//   UserCheck,
//   Wrench,
// } from "lucide-react";
// import { useMemo } from "react";
// import { useNavigate } from "react-router-dom";

// function Index() {
//   const navigate = useNavigate();

//   const quickLinks = useMemo(
//     () => [
//       {
//         title: "Dashboard bảo trì",
//         desc: "Tổng quan sự cố, kế hoạch, tiến độ sửa chữa.",
//         icon: ClipboardCheck,
//         tone: "text-sky-400",
//         path: "/bao-tri",
//       },
//       {
//         title: "Kế hoạch bảo trì định kỳ",
//         desc: "Lập và theo dõi kế hoạch theo chu kỳ.",
//         icon: Wrench,
//         tone: "text-violet-400",
//         path: "/ke-hoach-bao-tri-dinh-ky",
//       },
//       {
//         title: "Ghi nhận sự cố tài sản",
//         desc: "Tạo sự cố, theo dõi trạng thái xử lý.",
//         icon: AlertTriangle,
//         tone: "text-orange-400",
//         path: "/su-co-tai-san",
//       },
//       {
//         title: "Phân công sửa chữa",
//         desc: "Giao việc cho người sửa và quản lý tiến độ.",
//         icon: UserCheck,
//         tone: "text-emerald-400",
//         path: "/phan-cong-sua-chua",
//       },
//       {
//         title: "Lịch sử bảo trì",
//         desc: "Lưu lịch sử sửa chữa, chi phí, kết quả.",
//         icon: Clock,
//         tone: "text-teal-400",
//         path: "/lich-su-bao-tri",
//       },
//       {
//         title: "Báo cáo thống kê",
//         desc: "Thống kê, tổng hợp và xuất báo cáo.",
//         icon: BarChart3,
//         tone: "text-blue-400",
//         path: "/thongke",
//       },
//     ],
//     [],
//   );

//   return (
//   /* Đổi nền chính thành trắng xám nhạt, chữ đen */
//   <div className="min-h-screen bg-zinc-50 text-zinc-900">
//     {/* Header trắng bóng bẩy */}
//     <header className="border-b border-zinc-200 bg-white/80 backdrop-blur py-4 sticky top-0 z-20">
//       <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
//         <div className="flex items-center gap-4 min-w-0">
//           <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
//             <Shield className="w-6 h-6 text-white" />
//           </div>
//           <div className="min-w-0">
//             <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 truncate">
//               QLTS - TDMU
//             </h1>
//             <p className="text-sm text-zinc-500 truncate">
//               Hệ thống Quản lý Tài sản tích hợp AI hỗ trợ bảo trì
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 shrink-0">
//           <button
//             onClick={() => navigate("/assets")}
//             className="hidden sm:inline-flex px-4 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-2xl font-medium transition-colors"
//           >
//             Danh sách tài sản
//           </button>
//           <button
//             onClick={() => navigate("/bao-tri")}
//             className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-medium shadow-md transition-all"
//           >
//             Vào khu vực bảo trì
//           </button>
//           <button
//             onClick={() => navigate("/login")}
//             className="px-4 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-2xl font-medium transition-colors"
//           >
//             Đăng nhập
//           </button>
//           <ThemeToggle />
//         </div>
//       </div>
//     </header>

//     {/* Section Hero sáng sủa hơn */}
//     <section className="max-w-7xl mx-auto px-6 pt-14 sm:pt-20 pb-10 sm:pb-14 text-center">
//       <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-5 text-zinc-900">
//         HỆ THỐNG QUẢN LÝ TÀI SẢN
//         <br />
//         <span className="text-blue-600">
//           TÍCH HỢP AI HỖ TRỢ THÔNG TIN BẢO TRÌ TDMU
//         </span>
//       </h2>
//       <p className="text-base sm:text-xl text-zinc-600 max-w-3xl mx-auto">
//         Quản lý vòng đời tài sản • Ghi nhận sự cố • Lập kế hoạch bảo trì định kỳ
//         • Phân công sửa chữa • Lịch sử & chi phí • Báo cáo thống kê • Trợ lý AI
//       </p>

//       <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
//         <button
//           onClick={() => navigate("/bao-tri")}
//           className="px-7 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl text-base sm:text-lg font-semibold shadow-lg shadow-blue-100"
//         >
//           Truy cập Dashboard bảo trì
//         </button>
//         <button
//           onClick={() => navigate("/ai-chat")}
//           className="px-7 py-4 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-3xl text-base sm:text-lg font-medium flex items-center justify-center gap-3 shadow-sm transition-all"
//         >
//           <Bot className="w-5 h-5 text-blue-600" /> Hỏi trợ lý AI
//         </button>
//       </div>

//       {/* Grid con số/mục tiêu dùng nền trắng border nhạt */}
//       <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-4xl mx-auto">
//         {["Mục tiêu", "Trọng tâm", "AI hỗ trợ"].map((label, idx) => (
//           <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
//             <p className="text-sm text-zinc-500 font-medium">{label}</p>
//             <p className="mt-1 font-semibold text-zinc-800">
//               {idx === 0 && "Chuẩn hóa quy trình bảo trì – sửa chữa trong trường."}
//               {idx === 1 && "Dữ liệu tập trung + theo dõi trạng thái theo thời gian."}
//               {idx === 2 && "Tra cứu nhanh, gợi ý bước xử lý và tổng hợp thông tin."}
//             </p>
//           </div>
//         ))}
//       </div>
//     </section>

//     {/* Các Section bên dưới cũng áp dụng tương tự */}
//     <section className="max-w-7xl mx-auto px-6 py-10">
//       <div className="flex items-end justify-between gap-4 mb-6 text-left">
//         <div>
//           <h3 className="text-2xl font-bold text-zinc-900">Điều hướng nhanh</h3>
//           <p className="text-zinc-500">Truy cập nhanh các phân hệ chính của đề tài.</p>
//         </div>
//         <button
//           onClick={() => navigate("/dashboard")}
//           className="hidden sm:inline-flex px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-2xl font-medium"
//         >
//           Tổng quan hệ thống
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {quickLinks.map((x) => (
//           <button
//             key={x.title}
//             onClick={() => navigate(x.path)}
//             className="text-left bg-white border border-zinc-200 hover:border-blue-400 hover:shadow-md transition-all rounded-3xl p-6 group"
//           >
//             <div className="flex items-start justify-between gap-4">
//               <div>
//                 <p className="text-lg font-bold text-zinc-900">{x.title}</p>
//                 <p className="text-sm text-zinc-500 mt-1">{x.desc}</p>
//               </div>
//               <x.icon className={`w-10 h-10 ${x.tone} shrink-0 opacity-80 group-hover:opacity-100`} />
//             </div>
//           </button>
//         ))}
//       </div>
//     </section>

//     <footer className="text-center py-10 text-zinc-400 text-sm border-t border-zinc-100">
//       © 2026 Hệ thống Quản lý Tài sản - Trường Đại học Thủ Dầu Một
//     </footer>
//   </div>
// );
// }

// export default Index;


//Giao diện 2
//import ThemeToggle from '../components/ThemeToggle';
// import {
//   AlertTriangle,
//   BarChart3,
//   Bot,
//   Calendar,
//   CheckCircle,
//   ClipboardCheck,
//   Clock,
//   Shield,
//   UserCheck,
//   Wrench,
// } from "lucide-react";
// import { useMemo } from "react";
// import { useNavigate } from "react-router-dom";

// function Index() {
//   const navigate = useNavigate();

//   const quickLinks = useMemo(
//     () => [
//       {
//         title: "Dashboard bảo trì",
//         desc: "Tổng quan sự cố, kế hoạch, tiến độ sửa chữa.",
//         icon: ClipboardCheck,
//         tone: "text-sky-400",
//         path: "/bao-tri",
//       },
//       {
//         title: "Kế hoạch bảo trì định kỳ",
//         desc: "Lập và theo dõi kế hoạch theo chu kỳ.",
//         icon: Wrench,
//         tone: "text-violet-400",
//         path: "/ke-hoach-bao-tri-dinh-ky",
//       },
//       {
//         title: "Ghi nhận sự cố tài sản",
//         desc: "Tạo sự cố, theo dõi trạng thái xử lý.",
//         icon: AlertTriangle,
//         tone: "text-orange-400",
//         path: "/su-co-tai-san",
//       },
//       {
//         title: "Phân công sửa chữa",
//         desc: "Giao việc cho người sửa và quản lý tiến độ.",
//         icon: UserCheck,
//         tone: "text-emerald-400",
//         path: "/phan-cong-sua-chua",
//       },
//       {
//         title: "Lịch sử bảo trì",
//         desc: "Lưu lịch sử sửa chữa, chi phí, kết quả.",
//         icon: Clock,
//         tone: "text-teal-400",
//         path: "/lich-su-bao-tri",
//       },
//       {
//         title: "Báo cáo thống kê",
//         desc: "Thống kê, tổng hợp và xuất báo cáo.",
//         icon: BarChart3,
//         tone: "text-blue-400",
//         path: "/thongke",
//       },
//     ],
//     [],
//   );

//   return (
//   /* Đổi nền chính thành trắng xám nhạt, chữ đen */
//   <div className="min-h-screen bg-zinc-50 text-zinc-900">
//     {/* Header trắng bóng bẩy */}
//     <header className="border-b border-zinc-200 bg-white/80 backdrop-blur py-4 sticky top-0 z-20">
//       <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
//         <div className="flex items-center gap-4 min-w-0">
//           <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
//             <Shield className="w-6 h-6 text-white" />
//           </div>
//           <div className="min-w-0">
//             <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 truncate">
//               QLTS - TDMU
//             </h1>
//             <p className="text-sm text-zinc-500 truncate">
//               Hệ thống Quản lý Tài sản tích hợp AI hỗ trợ bảo trì
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 shrink-0">
//           <button
//             onClick={() => navigate("/assets")}
//             className="hidden sm:inline-flex px-4 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-2xl font-medium transition-colors"
//           >
//             Danh sách tài sản
//           </button>
//           <button
//             onClick={() => navigate("/bao-tri")}
//             className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-medium shadow-md transition-all"
//           >
//             Vào khu vực bảo trì
//           </button>
//           <button
//             onClick={() => navigate("/login")}
//             className="px-4 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-2xl font-medium transition-colors"
//           >
//             Đăng nhập
//           </button>
//           <ThemeToggle />
//         </div>
//       </div>
//     </header>

//     {/* Section Hero sáng sủa hơn */}
//     <section className="max-w-7xl mx-auto px-6 pt-14 sm:pt-20 pb-10 sm:pb-14 text-center">
//       <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-5 text-zinc-900">
//         HỆ THỐNG QUẢN LÝ TÀI SẢN
//         <br />
//         <span className="text-blue-600">
//           TÍCH HỢP AI HỖ TRỢ THÔNG TIN BẢO TRÌ TDMU
//         </span>
//       </h2>
//       <p className="text-base sm:text-xl text-zinc-600 max-w-3xl mx-auto">
//         Quản lý vòng đời tài sản • Ghi nhận sự cố • Lập kế hoạch bảo trì định kỳ
//         • Phân công sửa chữa • Lịch sử & chi phí • Báo cáo thống kê • Trợ lý AI
//       </p>

//       <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
//         <button
//           onClick={() => navigate("/bao-tri")}
//           className="px-7 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl text-base sm:text-lg font-semibold shadow-lg shadow-blue-100"
//         >
//           Truy cập Dashboard bảo trì
//         </button>
//         <button
//           onClick={() => navigate("/ai-chat")}
//           className="px-7 py-4 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-3xl text-base sm:text-lg font-medium flex items-center justify-center gap-3 shadow-sm transition-all"
//         >
//           <Bot className="w-5 h-5 text-blue-600" /> Hỏi trợ lý AI
//         </button>
//       </div>

//       {/* Grid con số/mục tiêu dùng nền trắng border nhạt */}
//       <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-4xl mx-auto">
//         {["Mục tiêu", "Trọng tâm", "AI hỗ trợ"].map((label, idx) => (
//           <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
//             <p className="text-sm text-zinc-500 font-medium">{label}</p>
//             <p className="mt-1 font-semibold text-zinc-800">
//               {idx === 0 && "Chuẩn hóa quy trình bảo trì – sửa chữa trong trường."}
//               {idx === 1 && "Dữ liệu tập trung + theo dõi trạng thái theo thời gian."}
//               {idx === 2 && "Tra cứu nhanh, gợi ý bước xử lý và tổng hợp thông tin."}
//             </p>
//           </div>
//         ))}
//       </div>
//     </section>

//     {/* Các Section bên dưới cũng áp dụng tương tự */}
//     <section className="max-w-7xl mx-auto px-6 py-10">
//       <div className="flex items-end justify-between gap-4 mb-6 text-left">
//         <div>
//           <h3 className="text-2xl font-bold text-zinc-900">Điều hướng nhanh</h3>
//           <p className="text-zinc-500">Truy cập nhanh các phân hệ chính của đề tài.</p>
//         </div>
//         <button
//           onClick={() => navigate("/dashboard")}
//           className="hidden sm:inline-flex px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-2xl font-medium"
//         >
//           Tổng quan hệ thống
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {quickLinks.map((x) => (
//           <button
//             key={x.title}
//             onClick={() => navigate(x.path)}
//             className="text-left bg-white border border-zinc-200 hover:border-blue-400 hover:shadow-md transition-all rounded-3xl p-6 group"
//           >
//             <div className="flex items-start justify-between gap-4">
//               <div>
//                 <p className="text-lg font-bold text-zinc-900">{x.title}</p>
//                 <p className="text-sm text-zinc-500 mt-1">{x.desc}</p>
//               </div>
//               <x.icon className={`w-10 h-10 ${x.tone} shrink-0 opacity-80 group-hover:opacity-100`} />
//             </div>
//           </button>
//         ))}
//       </div>
//     </section>

//     <footer className="text-center py-10 text-zinc-400 text-sm border-t border-zinc-100">
//       © 2026 Hệ thống Quản lý Tài sản - Trường Đại học Thủ Dầu Một
//     </footer>
//   </div>
// );
// }

// export default Index;
// vẫn chưa thay đổi giao diện này