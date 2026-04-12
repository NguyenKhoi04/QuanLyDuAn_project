"use client";

import AppShell from "@/components/AppShell";
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
import { ChevronLeft, ChevronRight, Clock, Download, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from 'xlsx';

interface LichSuBaoTri {
  malichsu: number;
  mataisan: number;
  macode: string;           // từ taisan
  tentaisan: string;        // từ taisan
  ngaysua: string;
  nguoisua: string; 
  hoten: string;            // hoten từ nguoidung
  ketqua: string;
  chiphi: number;
}

const ITEMS_PER_PAGE = 7;

function toCsv(rows: LichSuBaoTri[]) {
  const header = ["Mã Lịch Sử", "Mã Code", "Mã TS", "Tên Tài Sản", "Ngày Sửa", "Người Sửa", "Kết Quả", "Chi Phí (VND)"];
  
  const escape = (v: string) => `"${v.replaceAll('"', '""')}"`;
  
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        String(r.malichsu),
        escape(r.macode),
        String(r.mataisan),
        escape(r.tentaisan),
        escape(r.ngaysua),
        escape(r.hoten),
        escape(r.ketqua),
        String(r.chiphi ?? 0),
      ].join(",")
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
  const [data, setData] = useState<LichSuBaoTri[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  // ====================== FETCH DATA ======================
  const fetchLichSu = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lichsubaotri")
      .select(`
        malichsu,
        mataisan,
        ngaysua,
        nguoisua,
        ketqua,
        chiphi,
        taisan (
          macode,
          tentaisan
        ),
        nguoidung (
          hoten
        )
      `)
      .order("ngaysua", { ascending: false });

    if (error) {
      console.error("Lỗi lấy lịch sử bảo trì:", error);
    } else {
      const mapped = data?.map((item: any) => ({
        malichsu: item.malichsu,
        mataisan: item.mataisan,
        macode: item.taisan?.macode || "N/A",
        tentaisan: item.taisan?.tentaisan || "Không tìm thấy",
        ngaysua: item.ngaysua,
        nguoisua: item.nguoisua,
        hoten: item.nguoidung?.hoten || "Không rõ", // Lấy tên người sửa từ bảng nguoidung
        ketqua: item.ketqua,
        chiphi: item.chiphi || 0,
      })) || [];
      setData(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLichSu();
  }, []);

  // ====================== FILTER ======================
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((h) => {
      return (
        h.macode.toLowerCase().includes(q) ||
        String(h.mataisan).includes(q) ||
        h.tentaisan.toLowerCase().includes(q) ||
       // h.nguoisua.toLowerCase().includes(q) ||
        h.hoten.toLowerCase().includes(q) ||
        h.ketqua.toLowerCase().includes(q) ||
        h.ngaysua.includes(q)
      );
    });
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleExport = () => {
  const exportData = filtered.map((item, index) => ({
    "STT": index + 1,
    "Mã Code": item.macode,
    "Mã TS": item.mataisan,
    "Tên Tài Sản": item.tentaisan,
    "Ngày Sửa": item.ngaysua,
    "Người Sửa": item.hoten,
    "Kết Quả": item.ketqua,
    "Chi Phí (VND)": Number(item.chiphi ?? 0),
  }));

  // Tính tổng chi phí
  const totalChiPhi = filtered.reduce((sum, item) => sum + Number(item.chiphi ?? 0), 0);

  // Tạo worksheet với header rõ ràng
  const ws = XLSX.utils.json_to_sheet(exportData);

  // ==================== THÊM TIÊU ĐỀ BÁO CÁO ====================
  XLSX.utils.sheet_add_aoa(ws, [["LỊCH SỬ BẢO TRÌ & SỬA CHỮA"]], { origin: "A1" });
  XLSX.utils.sheet_add_aoa(ws, [[`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`]], { origin: "A2" });
  XLSX.utils.sheet_add_aoa(ws, [[`Người xuất báo cáo: Quản trị viên`]], { origin: "A3" });

  // Merge tiêu đề
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
  ];

  // Style tiêu đề
  if (ws['A1']) ws['A1'].s = { 
    font: { bold: true, sz: 18, color: { rgb: "1e40af" } }, 
    alignment: { horizontal: "center" } 
  };

  // Dòng tổng chi phí
  const lastDataRow = exportData.length + 4; // +4 vì có 3 dòng tiêu đề
  XLSX.utils.sheet_add_aoa(ws, [[
    "", "", "", "", "", "", "TỔNG CHI PHÍ:", 
    Number(totalChiPhi).toLocaleString('vi-VN')
  ]], { origin: `A${lastDataRow}` });

  // Style dòng tổng
  if (ws[`G${lastDataRow}`]) ws[`G${lastDataRow}`].s = { font: { bold: true } };
  if (ws[`H${lastDataRow}`]) ws[`H${lastDataRow}`].s = { 
    font: { bold: true }, 
    alignment: { horizontal: "right" } 
  };

  // Độ rộng cột
  ws['!cols'] = [
    { wch: 6 }, { wch: 15 }, { wch: 12 }, { wch: 45 },
    { wch: 15 }, { wch: 28 }, { wch: 22 }, { wch: 22 }
  ];

  // Tạo và xuất file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Lịch Sử Bảo Trì");

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Lich_Su_Bao_Tri_${today}.xlsx`);
};

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Lịch sử bảo trì & sửa chữa
          </h2>
          <p className="text-sm text-muted-foreground">
            Lưu lịch sử bảo trì, sửa chữa tài sản
          </p>
        </div>

        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" /> Xuất báo cáo (Excel)
        </Button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo mã tài sản, tên, người sửa, kết quả..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm">
        {loading ? (
          <p className="text-center py-12">Đang tải dữ liệu...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
                <TableHead className="w-28">Mã Code</TableHead>
                <TableHead className="w-28">Mã TS</TableHead>
                <TableHead>Tên tài sản</TableHead>
                <TableHead className="w-40">Ngày sửa</TableHead>
                <TableHead>Người sửa</TableHead>
                <TableHead className="w-32">Kết quả</TableHead>
                <TableHead className="text-right w-44">Chi phí (VND)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((item, idx) => (
                <TableRow key={item.malichsu}>
                  <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                  <TableCell className="font-mono font-medium">{item.macode}</TableCell>
                  <TableCell className="font-mono">#{item.mataisan}</TableCell>
                  <TableCell className="font-medium">{item.tentaisan}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{item.ngaysua}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.hoten}</TableCell>
                  <TableCell className="text-emerald-600 dark:text-emerald-400">
                    {item.ketqua}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {Number(item.chiphi ?? 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}

              {paged.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Không có lịch sử nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
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
    </AppShell>
  );
}

export default MaintenanceHistory;