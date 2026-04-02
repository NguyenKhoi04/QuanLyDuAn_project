import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const completionTrendData = [
  { name: "Tuần 1", uv: 590, pv: 800, amt: 1400 },
  { name: "Tuần 2", uv: 868, pv: 967, amt: 1506 },
  { name: "Tuần 3", uv: 1397, pv: 1098, amt: 989 },
  { name: "Tuần 4", uv: 1480, pv: 1200, amt: 1228 },
  { name: "Tuần 5", uv: 1520, pv: 1108, amt: 1100 },
  { name: "Tuần 6", uv: 1400, pv: 680, amt: 1700 },
];

type TrangThaiSuCo = "Chưa xử lý" | "Đang xử lý" | "Đã xử lý" | "Tạm hoãn";

interface SuCoTaiSan {
  MaSuCo: number;
  MaTaiSan: number;
  MoTaSuCo: string;
  MucDo: string;
  NgayXayRa: string; // yyyy-mm-dd
  TrangThai: TrangThaiSuCo | string;
}

type TrangThaiKeHoach =
  | "Đang lên kế hoạch"
  | "Sẵn sàng"
  | "Đang thực hiện"
  | "Hoàn thành"
  | "Tạm hoãn";

interface KeHoachBaoTri {
  MaKeHoach: number;
  MaTaiSan: number;
  TenTaiSan: string;
  NgayBaoTri: string; // yyyy-mm-dd
  ChuKy: string;
  NguoiPhuTrach: string;
  TrangThai: TrangThaiKeHoach | string;
}

const incidentStatusVariant: Record<
  TrangThaiSuCo,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "Chưa xử lý": "outline",
  "Đang xử lý": "secondary",
  "Đã xử lý": "default",
  "Tạm hoãn": "destructive",
};

const planStatusVariant: Record<
  Exclude<TrangThaiKeHoach, never>,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "Đang lên kế hoạch": "outline",
  "Sẵn sàng": "default",
  "Đang thực hiện": "secondary",
  "Hoàn thành": "default",
  "Tạm hoãn": "destructive",
};

function isTrangThaiSuCo(v: string): v is TrangThaiSuCo {
  return (
    v === "Chưa xử lý" ||
    v === "Đang xử lý" ||
    v === "Đã xử lý" ||
    v === "Tạm hoãn"
  );
}

function isTrangThaiKeHoach(v: string): v is TrangThaiKeHoach {
  return (
    v === "Đang lên kế hoạch" ||
    v === "Sẵn sàng" ||
    v === "Đang thực hiện" ||
    v === "Hoàn thành" ||
    v === "Tạm hoãn"
  );
}

function startOfDayISO(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

function MaintenanceDashboard() {
  const [incidents, setIncidents] = useState<SuCoTaiSan[]>([]);
  const [plans, setPlans] = useState<KeHoachBaoTri[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/suCoTaiSan")
      .then((res) => {
        if (Array.isArray(res.data)) setIncidents(res.data);
      })
      .catch(() => {
        setIncidents([
          {
            MaSuCo: 1,
            MaTaiSan: 101,
            MoTaSuCo: "Máy bơm bị rò rỉ",
            MucDo: "Cao",
            NgayXayRa: startOfDayISO(new Date()),
            TrangThai: "Chưa xử lý",
          },
        ]);
      });

    axios
      .get("http://localhost:3000/keHoachBaoTri")
      .then((res) => {
        if (Array.isArray(res.data)) setPlans(res.data);
      })
      .catch(() => {
        setPlans([
          {
            MaKeHoach: 1,
            MaTaiSan: 101,
            TenTaiSan: "Máy bơm nước",
            NgayBaoTri: "2026-04-15",
            ChuKy: "Hàng tháng",
            NguoiPhuTrach: "Nguyễn Văn A",
            TrangThai: "Đang lên kế hoạch",
          },
          {
            MaKeHoach: 2,
            MaTaiSan: 102,
            TenTaiSan: "Hệ thống HVAC",
            NgayBaoTri: "2026-05-01",
            ChuKy: "Hàng quý",
            NguoiPhuTrach: "Trần Thị B",
            TrangThai: "Sẵn sàng",
          },
        ]);
      });
  }, []);

  const todayISO = useMemo(() => startOfDayISO(new Date()), []);

  const kpis = useMemo(() => {
    const suCoHomNay = incidents.filter((i) => i.NgayXayRa === todayISO).length;
    const tongKeHoach = plans.length;
    const keHoachHoanThanh = plans.filter((p) => p.TrangThai === "Hoàn thành")
      .length;
    const dangSua = plans.filter((p) => p.TrangThai === "Đang thực hiện").length;

    return {
      suCoHomNay,
      tongKeHoach,
      keHoachHoanThanh,
      dangSua,
    };
  }, [incidents, plans, todayISO]);

  const recentIncidents = useMemo(() => {
    return [...incidents]
      .sort((a, b) => b.NgayXayRa.localeCompare(a.NgayXayRa))
      .slice(0, 6);
  }, [incidents]);

  const upcomingPlans = useMemo(() => {
    return [...plans]
      .filter((p) => p.NgayBaoTri >= todayISO)
      .sort((a, b) => a.NgayBaoTri.localeCompare(b.NgayBaoTri))
      .slice(0, 6);
  }, [plans, todayISO]);

  return (
    <AppShell>
          <h2 className="text-3xl font-bold text-foreground mb-1">
            Dashboard bảo trì
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Tổng quan quản lý bảo trì - sửa chữa
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sự cố hôm nay</p>
                  <p className="text-4xl font-bold text-orange-500 mt-2">
                    {String(kpis.suCoHomNay).padStart(2, "0")}
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-5">
                Dựa trên dữ liệu sự cố ngày {todayISO}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kế hoạch bảo trì</p>
                  <p className="text-4xl font-bold text-violet-500 mt-2">
                    {String(kpis.tongKeHoach).padStart(2, "0")}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-violet-500" />
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-5">
                {kpis.keHoachHoanThanh} kế hoạch đã hoàn thành
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Đang sửa chữa</p>
                  <p className="text-4xl font-bold text-amber-500 mt-2">
                    {String(kpis.dangSua).padStart(2, "0")}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-amber-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-5">
                Trạng thái “Đang thực hiện”
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Hoàn thành (tổng)
                  </p>
                  <p className="text-4xl font-bold text-emerald-500 mt-2">
                    {String(kpis.keHoachHoanThanh).padStart(2, "0")}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="flex items-center gap-2 text-xs mt-5 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
                <span>+15% so với tháng trước (demo)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Tỷ lệ hoàn thành 30 ngày qua
              </h3>
              <Button variant="outline" size="sm" disabled>
                Demo dữ liệu
              </Button>
            </div>
            <div className="h-64 w-full min-w-0 rounded-md bg-muted/30">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={completionTrendData}
                  margin={{ top: 12, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.6} />
                  <XAxis
                    dataKey="name"
                    scale="band"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    width={48}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="pv"
                    name="Mục tiêu"
                    barSize={20}
                    fill="#413ea0"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="uv"
                    name="Hoàn thành"
                    stroke="#ff7300"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Sự cố gần đây</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Mã TS</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="w-28">Ngày</TableHead>
                    <TableHead className="w-36">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentIncidents.map((i) => {
                    const variant =
                      isTrangThaiSuCo(i.TrangThai)
                        ? incidentStatusVariant[i.TrangThai]
                        : "outline";
                    return (
                      <TableRow key={i.MaSuCo}>
                        <TableCell className="font-mono text-xs">
                          #{i.MaTaiSan}
                        </TableCell>
                        <TableCell className="font-medium line-clamp-1">
                          {i.MoTaSuCo}
                        </TableCell>
                        <TableCell className="text-xs">{i.NgayXayRa}</TableCell>
                        <TableCell>
                          <Badge variant={variant}>{i.TrangThai}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {recentIncidents.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Chưa có sự cố
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Kế hoạch bảo trì sắp tới</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Mã TS</TableHead>
                    <TableHead>Tên tài sản</TableHead>
                    <TableHead className="w-28">Ngày</TableHead>
                    <TableHead className="w-36">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingPlans.map((p) => {
                    const variant =
                      isTrangThaiKeHoach(p.TrangThai)
                        ? planStatusVariant[p.TrangThai]
                        : "outline";
                    return (
                      <TableRow key={p.MaKeHoach}>
                        <TableCell className="font-mono text-xs">
                          #{p.MaTaiSan}
                        </TableCell>
                        <TableCell className="font-medium line-clamp-1">
                          {p.TenTaiSan}
                        </TableCell>
                        <TableCell className="text-xs">{p.NgayBaoTri}</TableCell>
                        <TableCell>
                          <Badge variant={variant}>{p.TrangThai}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {upcomingPlans.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Chưa có kế hoạch sắp tới
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
    </AppShell>
  );
}

export default MaintenanceDashboard;
