import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NONAME } from "dns";
import { Building2, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";

type AssetLocation = {
  MaTaiSan: number;
  TenTaiSan: string;
  ViTri: string;
  PhongBan: string;
  TrangThai: string;
};

const assets: AssetLocation[] = [
  {
    MaTaiSan: 101,
    TenTaiSan: "Máy tính Dell OptiPlex",
    ViTri: "Tòa A - Tầng 3 - Phòng A301",
    PhongBan: "Thực hành Máy tính - Dãy C",
    TrangThai: "Hoạt động",
  },
  {
    MaTaiSan: 102,
    TenTaiSan: "Máy chiếu Epson",
    ViTri: "Tòa I1 - Tầng 2 - Phòng I1.201",
    PhongBan: "Phòng Đào tạo",
    TrangThai: "Hoạt động",
  },
  {
    MaTaiSan: 103,
    TenTaiSan: "Bàn ghế gỗ",
    ViTri: "Khu tự học dãy I3-I4",
    PhongBan: NONAME,
    TrangThai: "Bình thường",
  },
];

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "Hoạt động") return "default";
  if (status === "Bình thường") return "secondary";
  if (status === "Không hoạt động") return "destructive";
  return "outline";
}

export default function AssetLocationTracking() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return assets;

    return assets.filter(
      (a) =>
        a.TenTaiSan.toLowerCase().includes(q) || a.ViTri.toLowerCase().includes(q),
    );
  }, [searchTerm]);

  return (
    <AppShell>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <MapPin className="w-8 h-8 text-blue-500" />
                Theo dõi vị trí tài sản
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Theo dõi vị trí hiện tại của tài sản theo tòa nhà và phòng ban
              </p>
            </div>

            <div className="relative w-full sm:w-80 shrink-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm theo tên tài sản hoặc vị trí..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Mã TS</TableHead>
                  <TableHead>Tên tài sản</TableHead>
                  <TableHead>Vị trí hiện tại</TableHead>
                  <TableHead className="w-48">Phòng ban</TableHead>
                  <TableHead className="w-36">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((asset) => (
                  <TableRow key={asset.MaTaiSan}>
                    <TableCell className="font-mono text-xs">#{asset.MaTaiSan}</TableCell>
                    <TableCell className="font-medium">{asset.TenTaiSan}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span className="line-clamp-1">{asset.ViTri}</span>
                      </div>
                    </TableCell>
                    <TableCell className="line-clamp-1">{asset.PhongBan}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(asset.TrangThai)}>{asset.TrangThai}</Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy tài sản phù hợp
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
    </AppShell>
  );
}

