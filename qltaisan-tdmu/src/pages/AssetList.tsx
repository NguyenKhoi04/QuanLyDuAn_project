import AppHeader from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
const loaiTaiSan: Record<number, string> = {
  1: "Máy tính",
  2: "Bàn ghế",
  3: "Máy chiếu",
  4: "Thiết bị mạng",
  5: "Điều hòa",
};

const phongBan: Record<number, string> = {
  1: "Phòng CNTT",
  2: "Phòng Kế toán",
  3: "Phòng Nhân sự",
  4: "Khoa CNTT",
  5: "Khoa Kinh tế",
};

const viTri: Record<number, string> = {
  1: "Tầng 1 - P101",
  2: "Tầng 1 - P102",
  3: "Tầng 2 - P201",
  4: "Tầng 2 - P202",
  5: "Tầng 3 - P301",
};

const nhaCungCap: Record<number, string> = {
  1: "Công ty ABC",
  2: "Công ty XYZ",
  3: "Công ty DEF",
  4: "Công ty GHI",
};

const trangThaiMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  1: { label: "Đang sử dụng", variant: "default" },
  2: { label: "Chờ cấp phát", variant: "secondary" },
  3: { label: "Đang sửa chữa", variant: "outline" },
  4: { label: "Thanh lý", variant: "destructive" },
};

interface TaiSan {
  MaTaiSan: number;
  MaCode: string;
  TenTaiSan: string;
  MaLoai: number;
  MaPhongBan: number;
  MaViTri: number;
  MaNhaCungCap: number | null;
  NgayMua: string | null;
  TrangThai: number;
}

const sampleData: TaiSan[] = [
  { MaTaiSan: 1, MaCode: "TS001", TenTaiSan: "Máy tính Dell Vostro 3510", MaLoai: 1, MaPhongBan: 1, MaViTri: 1, MaNhaCungCap: 1, NgayMua: "2023-03-15", TrangThai: 1 },
  { MaTaiSan: 2, MaCode: "TS002", TenTaiSan: "Máy tính HP ProBook 450", MaLoai: 1, MaPhongBan: 4, MaViTri: 3, MaNhaCungCap: 2, NgayMua: "2023-05-20", TrangThai: 1 },
  { MaTaiSan: 3, MaCode: "TS003", TenTaiSan: "Bàn làm việc 1m2", MaLoai: 2, MaPhongBan: 2, MaViTri: 2, MaNhaCungCap: 3, NgayMua: "2022-11-10", TrangThai: 1 },
  { MaTaiSan: 4, MaCode: "TS004", TenTaiSan: "Ghế xoay văn phòng", MaLoai: 2, MaPhongBan: 3, MaViTri: 4, MaNhaCungCap: 3, NgayMua: "2022-11-10", TrangThai: 2 },
  { MaTaiSan: 5, MaCode: "TS005", TenTaiSan: "Máy chiếu Epson EB-X51", MaLoai: 3, MaPhongBan: 4, MaViTri: 3, MaNhaCungCap: 1, NgayMua: "2024-01-08", TrangThai: 1 },
  { MaTaiSan: 6, MaCode: "TS006", TenTaiSan: "Switch Cisco 24 port", MaLoai: 4, MaPhongBan: 1, MaViTri: 1, MaNhaCungCap: 2, NgayMua: "2023-07-22", TrangThai: 3 },
  { MaTaiSan: 7, MaCode: "TS007", TenTaiSan: "Điều hòa Daikin 12000BTU", MaLoai: 5, MaPhongBan: 5, MaViTri: 5, MaNhaCungCap: 4, NgayMua: "2021-06-15", TrangThai: 4 },
  { MaTaiSan: 8, MaCode: "TS008", TenTaiSan: "Máy tính Lenovo ThinkPad", MaLoai: 1, MaPhongBan: 2, MaViTri: 2, MaNhaCungCap: 1, NgayMua: "2024-02-28", TrangThai: 2 },
  { MaTaiSan: 9, MaCode: "TS009", TenTaiSan: "Router WiFi TP-Link", MaLoai: 4, MaPhongBan: 1, MaViTri: 1, MaNhaCungCap: 2, NgayMua: "2023-09-05", TrangThai: 1 },
  { MaTaiSan: 10, MaCode: "TS010", TenTaiSan: "Máy chiếu BenQ MH560", MaLoai: 3, MaPhongBan: 5, MaViTri: 5, MaNhaCungCap: 4, NgayMua: null, TrangThai: 2 },
];
function AssetList() {
  const [assets, setAssets] = useState<TaiSan[]>(sampleData);

   const [search, setSearch] = useState("");

  const filtered = sampleData.filter(
    (ts) =>
      ts.TenTaiSan.toLowerCase().includes(search.toLowerCase()) ||
      ts.MaCode.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    axios.get("http://localhost:3000/assets")
      .then(res => setAssets(res.data));
  }, []);

  return (
     <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Danh sách tài sản</h2>
            <Button className="bg-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Thêm tài sản
            </Button>
          </div>

          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Mã Code</TableHead>
                  <TableHead>Tên tài sản</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Ngày mua</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ts, idx) => {
                  const tt = trangThaiMap[ts.TrangThai];
                  return (
                    <TableRow key={ts.MaTaiSan}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{ts.MaCode}</TableCell>
                      <TableCell className="font-medium">{ts.TenTaiSan}</TableCell>
                      <TableCell>{loaiTaiSan[ts.MaLoai]}</TableCell>
                      <TableCell>{phongBan[ts.MaPhongBan]}</TableCell>
                      <TableCell>{viTri[ts.MaViTri]}</TableCell>
                      <TableCell>{ts.MaNhaCungCap ? nhaCungCap[ts.MaNhaCungCap] : "—"}</TableCell>
                      <TableCell>{ts.NgayMua ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={tt.variant}>{tt.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy tài sản nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AssetList;
