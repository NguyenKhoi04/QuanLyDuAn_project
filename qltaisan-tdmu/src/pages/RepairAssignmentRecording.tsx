"use client";

import AppShell from "@/components/AppShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type TrangThaiPhanCong = "Đang chờ" | "Đang sửa" | "Hoàn thành" | "Hủy";

interface PhanCongSuaChua {
  maphancong: number;
  mataisan: number;
  macode: string;           // từ taisan
  tentaisan: string;        // từ taisan
  manguoisua: number;
  hoten: string;            // từ nguoidung
  ngaydukienhoanthanh: string;
  trangthai: TrangThaiPhanCong;
}

const trangThaiVariant: Record<TrangThaiPhanCong, "default" | "secondary" | "destructive" | "outline"> = {
  "Đang chờ": "outline",
  "Đang sửa": "secondary",
  "Hoàn thành": "default",
  "Hủy": "destructive",
};

const ITEMS_PER_PAGE = 5;

function RepairAssignmentRecording() {
  const [data, setData] = useState<PhanCongSuaChua[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PhanCongSuaChua | null>(null);
  const [deleteItem, setDeleteItem] = useState<PhanCongSuaChua | null>(null);

  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");

  const emptyForm = useMemo(
    () => ({
      mataisan: "",
      manguoisua: "",
      ngaydukienhoanthanh: "",
      trangthai: "Đang chờ" as TrangThaiPhanCong,
    }),
    []
  );

  const [form, setForm] = useState(emptyForm);

  // ====================== FETCH DATA ======================
  const fetchPhanCong = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("phancongsuachua")
      .select(`
        maphancong,
        mataisan,
        manguoisua,
        ngaydukienhoanthanh,
        trangthai,
        taisan (
          macode,
          tentaisan
        ),
        nguoidung (
          hoten
        )
      `)
      .order("ngaydukienhoanthanh", { ascending: false });

    if (error) {
      console.error("Lỗi lấy phân công:", error);
    } else {
      const mapped = data?.map((item: any) => ({
        maphancong: item.maphancong,
        mataisan: item.mataisan,
        macode: item.taisan?.macode || "N/A",
        tentaisan: item.taisan?.tentaisan || "Không tìm thấy",
        manguoisua: item.manguoisua,
        hoten: item.nguoidung?.hoten || "Không rõ",
        ngaydukienhoanthanh: item.ngaydukienhoanthanh,
        trangthai: item.trangthai,
      })) || [];
      setData(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPhanCong();
  }, []);

  // ====================== FILTER ======================
  const filtered = data.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.macode.toLowerCase().includes(q) ||
      a.tentaisan.toLowerCase().includes(q) ||
      a.hoten.toLowerCase().includes(q) ||
      a.trangthai.toLowerCase().includes(q) ||
      a.ngaydukienhoanthanh.includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const resetForm = () => setForm(emptyForm);

  // ====================== CRUD ======================
  const handleSubmit = async () => {
    if (!form.mataisan || !form.manguoisua || !form.ngaydukienhoanthanh) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    const payload = {
      mataisan: Number(form.mataisan),
      manguoisua: Number(form.manguoisua),
      ngaydukienhoanthanh: form.ngaydukienhoanthanh,
      trangthai: form.trangthai,
    };

    if (editingItem) {
      await supabase.from("phancongsuachua").update(payload).eq("maphancong", editingItem.maphancong);
    } else {
      await supabase.from("phancongsuachua").insert([payload]);
    }

    resetForm();
    setDialogOpen(false);
    setEditingItem(null);
    fetchPhanCong();
  };

  const handleEdit = (item: PhanCongSuaChua) => {
    setEditingItem(item);
    setForm({
      mataisan: String(item.mataisan),
      manguoisua: String(item.manguoisua),
      ngaydukienhoanthanh: item.ngaydukienhoanthanh,
      trangthai: item.trangthai,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await supabase.from("phancongsuachua").delete().eq("maphancong", deleteItem.maphancong);
    setDeleteItem(null);
    fetchPhanCong();
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/phanCongSuaChua")
      .then((res) => {
        if (Array.isArray(res.data)) setData(res.data);
      })
      .catch(() => {
        // keep initialData when api is unavailable
      });
  }, []);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-500" />
            Phân công sửa chữa
          </h2>
          <p className="text-sm text-muted-foreground">
            Phân công người sửa chữa cho tài sản và theo dõi tiến độ
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { resetForm(); setEditingItem(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Plus className="h-4 w-4" /> Phân công mới
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Chỉnh sửa phân công" : "Phân công sửa chữa"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã tài sản *</Label>
                  <Input
                    type="number"
                    placeholder="VD: 101"
                    value={form.mataisan}
                    onChange={(e) => setForm({ ...form, mataisan: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mã người sửa *</Label>
                  <Input
                    type="number"
                    placeholder="VD: 1"
                    value={form.manguoisua}
                    onChange={(e) => setForm({ ...form, manguoisua: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày dự kiến hoàn thành *</Label>
                  <Input
                    type="date"
                    value={form.ngaydukienhoanthanh}
                    onChange={(e) => setForm({ ...form, ngaydukienhoanthanh: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trạng thái *</Label>
                  <Select value={form.trangthai} onValueChange={(v) => setForm({ ...form, trangthai: v as TrangThaiPhanCong })}>
                    <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                    <SelectContent>
                      {["Đang chờ", "Đang sửa", "Hoàn thành", "Hủy"].map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Hủy</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit}>
                {editingItem ? "Lưu thay đổi" : "Phân công"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo mã tài sản, người sửa, trạng thái..."
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
                <TableHead>Mã người sửa</TableHead>
                <TableHead>Người sửa</TableHead>
                <TableHead className="w-44">Dự kiến hoàn thành</TableHead>
                <TableHead className="w-32">Trạng thái</TableHead>
                <TableHead className="text-center w-24">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((item, idx) => (
                <TableRow key={item.maphancong}>
                  <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                  <TableCell className="font-mono font-medium">{item.macode}</TableCell>
                  <TableCell className="font-mono">{item.mataisan}</TableCell>
                  <TableCell className="font-medium">{item.tentaisan}</TableCell>
                  <TableCell className="font-mono">{item.manguoisua}</TableCell>
                  <TableCell className="font-medium">{item.hoten}</TableCell>
                  <TableCell>{item.ngaydukienhoanthanh}</TableCell>
                  <TableCell>
                    <Badge variant={trangThaiVariant[item.trangthai]}>{item.trangthai}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteItem(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    Không tìm thấy phân công nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Hiển thị {paged.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length} phân công
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AlertDialog xóa */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phân công</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phân công cho tài sản{" "}
              <strong>{deleteItem?.tentaisan}</strong> (Mã TS: {deleteItem?.mataisan})? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white" onClick={handleDelete}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

export default RepairAssignmentRecording;
