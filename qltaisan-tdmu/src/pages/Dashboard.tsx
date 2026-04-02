import AppShell from "@/components/AppShell";
import NotificationSystem from "@/components/NotificationSystem";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

const barData = [
  { name: "Phòng A1", soLuong: 45 },
  { name: "Phòng A2", soLuong: 32 },
  { name: "Phòng B1", soLuong: 58 },
  { name: "Phòng B2", soLuong: 27 },
  { name: "Phòng C1", soLuong: 41 },
  { name: "Phòng C2", soLuong: 36 },
];

const lineData = [
  { name: "Tháng 1", soLuong: 30 },
  { name: "Tháng 2", soLuong: 28 },
  { name: "Tháng 3", soLuong: 35 },
  { name: "Tháng 4", soLuong: 40 },
  { name: "Tháng 5", soLuong: 38 },
  { name: "Tháng 6", soLuong: 45 },
];

const pieData = [
  { name: "Máy tính", value: 120 },
  { name: "Bàn ghế", value: 85 },
  { name: "Máy chiếu", value: 30 },
  { name: "Thiết bị mạng", value: 45 },
  { name: "Khác", value: 60 },
];

const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#eab308", "#8b5cf6"];

function Dashboard() {
  return (
    <AppShell>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Tổng quan hệ thống
              </h2>
              <p className="text-sm text-muted-foreground">
                Kết hợp Bảo trì + Thống kê Tài sản (Trường Đại học Thủ Dầu Một)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationSystem />
              <div className="w-9 h-9 bg-muted rounded-2xl border border-border" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <p className="text-muted-foreground">Tổng số tài sản</p>
              <p className="text-4xl font-bold mt-3">360</p>
              <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-2">
                +12 so với tháng trước
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <p className="text-muted-foreground">Sự cố đang chờ</p>
              <p className="text-4xl font-bold mt-3 text-orange-500">7</p>
              <p className="text-red-500 text-sm mt-2">2 trường hợp khẩn cấp</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <p className="text-muted-foreground">Kế hoạch bảo trì</p>
              <p className="text-4xl font-bold mt-3">14</p>
              <p className="text-violet-600 dark:text-violet-400 text-sm mt-2">
                5 kế hoạch trong tuần này
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <p className="text-muted-foreground">Tài sản hoạt động</p>
              <p className="text-4xl font-bold mt-3 text-emerald-600 dark:text-emerald-400">
                340
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                94.4% tổng tài sản
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Phân loại tài sản</h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    label
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                Số lượng tài sản theo phòng
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="soLuong"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="text-orange-500" /> Tình hình bảo trì &
                Dự đoán AI
              </h3>
              <button className="text-sm text-violet-600 dark:text-violet-400 hover:opacity-90">
                Xem tất cả kế hoạch →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/40 border border-border rounded-lg p-5">
                <p className="text-orange-500 font-medium">Sự cố gần đây</p>
                <p className="text-3xl font-bold mt-2">03</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Máy bơm #101 - Rò rỉ (Khẩn cấp)
                </p>
              </div>
              <div className="bg-muted/40 border border-border rounded-lg p-5">
                <p className="text-violet-600 dark:text-violet-400 font-medium">
                  Gợi ý từ AI
                </p>
                <p className="text-3xl font-bold mt-2">2</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Tài sản #102 có nguy cơ hỏng cao trong 10 ngày tới
                </p>
              </div>
              <div className="bg-muted/40 border border-border rounded-lg p-5">
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Hoàn thành tháng này
                </p>
                <p className="text-3xl font-bold mt-2">28</p>
                <div className="flex items-center gap-2 text-sm mt-4 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>+15% so với tháng trước</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" /> Biến động số lượng
              tài sản theo tháng
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="soLuong"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Dữ liệu mẫu (có thể thay bằng API sau)</span>
            </div>
          </div>
    </AppShell>
  );
}

export default Dashboard;
