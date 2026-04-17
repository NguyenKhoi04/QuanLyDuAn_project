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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Clock, Download, Search, FilePlus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from 'xlsx';

// Định nghĩa Interface cho Form
interface NewHistoryForm {
  mataisan: string;
  nguoisua: string;
  ketqua: string;
  chiphi: number;
}

function MaintenanceHistory() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Trạng thái mở Modal
  
  // Form state
  const [formData, setFormData] = useState<NewHistoryForm>({
    mataisan: "",
    nguoisua: "", // Đây là ID người dùng (UUID hoặc integer tùy DB của bạn)
    ketqua: "",
    chiphi: 0,
  });

  const ITEMS_PER_PAGE = 7;

  // ====================== FETCH DATA ======================
  const fetchLichSu = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lichsubaotri")
      .select(`
        malichsu, mataisan, ngaysua, nguoisua, ketqua, chiphi,
        taisan ( macode, tentaisan ),
        nguoidung ( hoten )
      `)
      .order("ngaysua", { ascending: false });

    if (error) {
      console.error("Lỗi lấy lịch sử:", error);
    } else {
      const mapped = data?.map((item: any) => ({
        ...item,
        macode: item.taisan?.macode || "N/A",
        tentaisan: item.taisan?.tentaisan || "Không tìm thấy",
        hoten: item.nguoidung?.hoten || "Không rõ",
      })) || [];
      setData(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLichSu(); }, []);

  // ====================== THÊM MỚI (CREATE) ======================
  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from("lichsubaotri")
        .insert([{
          mataisan: parseInt(formData.mataisan),
          nguoisua: formData.nguoisua, // Cần đảm bảo ID này tồn tại trong bảng nguoidung
          ngaysua: new Date().toISOString(),
          ketqua: formData.ketqua,
          chiphi: formData.chiphi
        }]);

      if (error) throw error;
      
      // Thành công: Đóng modal, reset form và tải lại data
      setIsOpen(false);
      setFormData({ mataisan: "", nguoisua: "", ketqua: "", chiphi: 0 });
      fetchLichSu();
      alert("Thêm lịch sử thành công!");
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    }
  };

  // ====================== UI PHÂN TRANG & SEARCH ======================
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((h) => 
      h.macode.toLowerCase().includes(q) || 
      h.tentaisan.toLowerCase().includes(q) ||
      h.hoten.toLowerCase().includes(q)
    );
  }, [data, search]);

  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lịch sử bảo trì & sửa chữa</h2>
          <p className="text-sm text-muted-foreground">Theo dõi tiến độ và chi phí bảo trì tại TDMU</p>
        </div>

        <div className="flex items-center gap-2">
          {/* NÚT TẠO MỚI + DIALOG FORM */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm">
                <FilePlus className="h-4 w-4" /> Tạo hóa đơn
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm lịch sử sửa chữa</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mã Tài Sản (ID)</label>
                  <Input 
                    type="number" 
                    placeholder="VD: 1" 
                    value={formData.mataisan}
                    onChange={(e) => setFormData({...formData, mataisan: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID Người Sửa</label>
                  <Input 
                    placeholder="Nhập ID nhân viên kỹ thuật" 
                    value={formData.nguoisua}
                    onChange={(e) => setFormData({...formData, nguoisua: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nội dung sửa chữa / Kết quả</label>
                  <Input 
                    placeholder="VD: Thay pin, vệ sinh..." 
                    value={formData.ketqua}
                    onChange={(e) => setFormData({...formData, ketqua: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chi phí (VND)</label>
                  <Input 
                    type="number" 
                    value={formData.chiphi}
                    onChange={(e) => setFormData({...formData, chiphi: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
                <Button onClick={handleCreate} className="bg-blue-600">Lưu thông tin</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => {}} className="gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50">
            <Download className="h-4 w-4" /> Xuất Excel
          </Button>
        </div>
      </div>

      {/* THANH TÌM KIẾM */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo mã, tên tài sản..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* BẢNG DỮ LIỆU (Giữ nguyên logic Table cũ của bạn nhưng hiển thị state data mới) */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-16">STT</TableHead>
              <TableHead>Mã Code</TableHead>
              <TableHead>Tên tài sản</TableHead>
              <TableHead>Người sửa</TableHead>
              <TableHead>Kết quả</TableHead>
              <TableHead className="text-right">Chi phí</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((item, idx) => (
              <TableRow key={item.malichsu}>
                <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                <TableCell className="font-mono font-bold text-blue-600">{item.macode}</TableCell>
                <TableCell className="font-medium">{item.tentaisan}</TableCell>
                <TableCell>{item.hoten}</TableCell>
                <TableCell>
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                        {item.ketqua}
                    </span>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {Number(item.chiphi).toLocaleString()} đ
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}

export default MaintenanceHistory;