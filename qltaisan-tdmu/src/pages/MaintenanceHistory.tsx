import AppHeader from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { ChevronLeft, ChevronRight, Clock, Download, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface LichSuBaoTri {
  MaLichSu: number;
  MaTaiSan: number;
  NgaySua: string; // yyyy-mm-dd
  NguoiSua: string;
  KetQua: string;
  ChiPhi: number;
}

const initialData: LichSuBaoTri[] = [
  {
    MaLichSu: 1,
    MaTaiSan: 101,
    NgaySua: "2026-03-20",
    NguoiSua: "Nguyễn Văn A",
    KetQua: "Hoàn thành",
    ChiPhi: 2500000,
  },
  {
    MaLichSu: 2,
    MaTaiSan: 102,
    NgaySua: "2026-03-15",
    NguoiSua: "Trần Thị B",
    KetQua: "Hoàn thành",
    ChiPhi: 4500000,
  },
];

const ITEMS_PER_PAGE = 7;

function toCsv(rows: LichSuBaoTri[]) {
  const header = [
    "MaLichSu",
    "MaTaiSan",
    "NgaySua",
    "NguoiSua",
    "KetQua",
    "ChiPhi",
  ];
  const escape = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        String(r.MaLichSu),
        String(r.MaTaiSan),
        escape(r.NgaySua),
        escape(r.NguoiSua),
        escape(r.KetQua),
        String(r.ChiPhi ?? 0),
      ].join(","),
    ),
  ];
  return lines.join("\n");
}

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function MaintenanceHistory() {
  const [data, setData] = useState<LichSuBaoTri[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((h) => {
      return (
        String(h.MaTaiSan).includes(q) ||
        h.NgaySua.toLowerCase().includes(q) ||
        h.NguoiSua.toLowerCase().includes(q) ||
        h.KetQua.toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleExport = () => {
    const csv = toCsv(filtered);
    const today = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      `lich-su-bao-tri_${today}.csv`,
      csv,
      "text/csv;charset=utf-8",
    );
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/lichSuBaoTri")
      .then((res) => {
        if (Array.isArray(res.data)) setData(res.data);
      })
      .catch(() => {
        // keep initialData when api is unavailable
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Lịch sử bảo trì & sửa chữa
              </h2>
              <p className="text-sm text-muted-foreground">
                Lưu lịch sử bảo trì, sửa chữa (bảng LichSuBaoTri)
              </p>
            </div>

            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" /> Xuất báo cáo (CSV)
            </Button>
          </div>

          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã tài sản, ngày, người sửa, kết quả..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead className="w-28">Mã TS</TableHead>
                  <TableHead className="w-40">Ngày sửa</TableHead>
                  <TableHead>Người sửa</TableHead>
                  <TableHead className="w-32">Kết quả</TableHead>
                  <TableHead className="text-right w-44">Chi phí (VND)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((item, idx) => (
                  <TableRow key={item.MaLichSu}>
                    <TableCell>
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      #{item.MaTaiSan}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{item.NgaySua}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.NguoiSua}</TableCell>
                    <TableCell className="text-emerald-600 dark:text-emerald-400">
                      {item.KetQua}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {Number(item.ChiPhi ?? 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}

                {paged.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không có lịch sử nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Hiển thị{" "}
                {paged.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} /{" "}
                {filtered.length} bản ghi
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MaintenanceHistory;
