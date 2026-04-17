"use client";

import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"; // Cài shadcn/ui/select
import { FilePlus, Search, Download, Clock } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

function MaintenanceHistory() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Danh sách để đổ vào Select
  const [dsTaiSan, setDsTaiSan] = useState<any[]>([]);
  const [dsNguoiDung, setDsNguoiDung] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  // Form state
  const [formData, setFormData] = useState({
    mataisan: "",
    manguoidung: "",
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
        nguoidung!lichsubaotri_nguoisua_fkey ( manguoidung, hoten )
      `)
      .order("ngaysua", { ascending: false });

    if (!error) {
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

  // ====================== LẤY DANH SÁCH HỖ TRỢ FORM ======================
  const fetchSupportData = async () => {
    const { data: ts } = await supabase.from("taisan").select("mataisan, tentaisan");
    const { data: nd } = await supabase.from("nguoidung").select("manguoidung, hoten");
    if (ts) setDsTaiSan(ts);
    if (nd) setDsNguoiDung(nd);
  };

  useEffect(() => {
    fetchLichSu();
    fetchSupportData();
  }, []);

  // ====================== THÊM MỚI (CREATE) ======================
  const handleCreate = async () => {
    if (!formData.mataisan || !formData.manguoidung) {
      alert("Vui lòng chọn đầy đủ Tài sản và Người thực hiện!");
      return;
    }

    const { error } = await supabase
      .from("lichsubaotri")
      .insert([{
        mataisan: parseInt(formData.mataisan),
        nguoisua: parseInt(formData.manguoidung), // Liên kết manguoidung -> nguoisua
        ngaysua: new Date().toISOString(),
        ketqua: formData.ketqua,
        chiphi: formData.chiphi
      }]);

    if (!error) {
      setIsOpen(false);
      setFormData({ mataisan: "", manguoidung: "", ketqua: "", chiphi: 0 });
      fetchLichSu();
    } else {
      console.error(error);
      alert("Lỗi khi lưu dữ liệu");
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
          <h2 className="text-2xl font-bold">Lịch sử bảo trì & sửa chữa</h2>
          <p className="text-sm text-muted-foreground">Quản lý các hoạt động sửa chữa tại TDMU</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <FilePlus className="h-4 w-4" /> Tạo hóa đơn
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Ghi nhận bảo trì mới</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {/* CHỌN TÀI SẢN */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-700">Tên tài sản</label>
                  <Select onValueChange={(val) => setFormData({...formData, mataisan: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Chọn tài sản bảo trì --" />
                    </SelectTrigger>
                    <SelectContent>
                      {dsTaiSan.map((ts) => (
                        <SelectItem key={ts.mataisan} value={ts.mataisan.toString()}>
                          {ts.tentaisan} (ID: {ts.mataisan})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* CHỌN NGƯỜI SỬA */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-700">Người thực hiện sửa chữa</label>
                  <Select onValueChange={(val) => setFormData({...formData, manguoidung: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Chọn nhân viên kỹ thuật --" />
                    </SelectTrigger>
                    <SelectContent>
                      {dsNguoiDung.map((nd) => (
                        <SelectItem key={nd.manguoidung} value={nd.manguoidung.toString()}>
                          {nd.hoten}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Nội dung / Kết quả</label>
                  <Input 
                    placeholder="VD: Thay màn hình, Cài lại Win..." 
                    value={formData.ketqua}
                    onChange={(e) => setFormData({...formData, ketqua: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Chi phí (VND)</label>
                  <Input 
                    type="number"
                    value={formData.chiphi}
                    onChange={(e) => setFormData({...formData, chiphi: parseInt(e.target.value) || 0})}
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