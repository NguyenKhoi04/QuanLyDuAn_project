import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import AppHeader from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import { useNavigate } from "react-router-dom";

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

const COLORS = [
  "hsl(145, 63%, 32%)",
  "hsl(217, 91%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(45, 93%, 47%)",
  "hsl(280, 60%, 50%)",
];

const ThongKe = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 p-6 bg-background">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Biểu đồ thống kê tài sản
          </h2>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
              <p className="text-muted-foreground text-sm font-medium">
                Tổng số tài sản
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">360</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
              <p className="text-muted-foreground text-sm font-medium">
                Tổng số phòng
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">6</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
              <p className="text-muted-foreground text-sm font-medium">
                Số loại tài sản
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">5</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
              <p className="text-muted-foreground text-sm font-medium">
                Tài sản hoạt động
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">340</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie chart - Biểu đồ phân loại tài sách - biểu đồ tròn */}
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Phân loại tài sản
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
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
            {/* Bar chart - Số lượng tài sản theo phòng - biểu đồ cột */}
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Số lượng tài sản theo phòng
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="soLuong"
                    name="Số lượng"
                    fill="hsl(145, 63%, 32%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Line chart - Biểu đồ biến động tài sách theo tháng - biểu đồ đường*/}
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Biến động tài sản theo tháng
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="soLuong"
                    name="Số lượng"
                    stroke="hsl(217, 91%, 50%)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ThongKe;
