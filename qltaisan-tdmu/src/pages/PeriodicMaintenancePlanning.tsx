"use client";

import AppShell from "@/components/AppShell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import axios from "axios";

type ChuKyBaoTri = "Hàng tuần" | "Hàng tháng" | "Hàng quý" | "Hàng năm";

// ====================== TRẠNG THÁI (SỐ → CHỮ) ======================
const trangThaiMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  1: { label: "Đang lên kế hoạch", variant: "outline" },
  2: { label: "Sẵn sàng", variant: "default" },
  3: { label: "Đang thực hiện", variant: "secondary" },
  4: { label: "Hoàn thành", variant: "default" },
  5: { label: "Tạm hoãn", variant: "destructive" },
};
interface KeHoachBaoTri {
  makehoach: number;
  mataisan: number;
  macode: string;           // từ taisan
  tentaisan: string;        // từ taisan
  ngaybaotri: string;
  chuky: ChuKyBaoTri;
  nguoiphutrach: number;  // ID người phụ trách
  hoten: string;            // hoten từ nguoidung
  trangthai: number;        // ID trạng thái
}

const trangThaiVariant: Record<number, "default" | "secondary" | "destructive" | "outline"> = {
  1: "outline",
  2: "default",
  3: "secondary",
  4: "default",
  5: "destructive",
};

const ITEMS_PER_PAGE = 5;

function PeriodicMaintenancePlanning() {
  const [data, setData] = useState<KeHoachBaoTri[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KeHoachBaoTri | null>(null);
  const [deleteItem, setDeleteItem] = useState<KeHoachBaoTri | null>(null);

  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");

  const emptyForm = useMemo(
    () => ({
      mataisan: "",
      ngaybaotri: "",
      chuky: "" as ChuKyBaoTri,
      nguoiphutrach: "",
      trangthai: "",
    }),
    []
  );

  const [form, setForm] = useState(emptyForm);

  // ====================== FETCH DATA ======================
  const fetchKeHoach = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kehoachbaotri")
      .select(`
        makehoach,
        mataisan,
        ngaybaotri,
        chuky,
        nguoiphutrach,
        trangthai,
        taisan (
          macode,
          tentaisan
        ),
        nguoidung (
          hoten
        )
      `)
      .order("ngaybaotri", { ascending: false });

    if (error) {
      console.error("Lỗi lấy kế hoạch bảo trì:", error);
    } else {
      const mapped = data?.map((item: any) => ({
        makehoach: item.makehoach,
        mataisan: item.mataisan,
        macode: item.taisan?.macode || "N/A",
        tentaisan: item.taisan?.tentaisan || "Không tìm thấy",
        ngaybaotri: item.ngaybaotri,
        chuky: item.chuky,
        nguoiphutrach: item.nguoiphutrach,
        hoten: item.nguoidung?.hoten || "Không rõ",
        trangthai: item.trangthai,
      })) || [];
      setData(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKeHoach();
  }, []);

  // ====================== FILTER & PAGINATION ======================
  const filtered = data.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.macode.toLowerCase().includes(q) ||
      p.tentaisan.toLowerCase().includes(q) ||
      p.hoten.toLowerCase().includes(q) ||
      String(p.trangthai).includes(q)
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
    if (!form.mataisan || !form.ngaybaotri || !form.chuky || !form.nguoiphutrach || !form.trangthai) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    const payload = {
      mataisan: Number(form.mataisan),
      ngaybaotri: form.ngaybaotri,
      chuky: form.chuky,
      nguoiphutrach: Number(form.nguoiphutrach),
      trangthai: form.trangthai,
    };

    if (editingItem) {
      await supabase.from("kehoachbaotri").update(payload).eq("makehoach", editingItem.makehoach);
    } else {
      await supabase.from("kehoachbaotri").insert([payload]);
    }

    resetForm();
    setDialogOpen(false);
    setEditingItem(null);
    fetchKeHoach();
  };

  const handleEdit = (item: KeHoachBaoTri) => {
    setEditingItem(item);
    setForm({
      mataisan: String(item.mataisan),
      ngaybaotri: item.ngaybaotri,
      chuky: item.chuky,
      nguoiphutrach: String(item.nguoiphutrach),
      trangthai: String(item.trangthai),
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await supabase.from("kehoachbaotri").delete().eq("makehoach", deleteItem.makehoach);
    setDeleteItem(null);
    fetchKeHoach();
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/keHoachBaoTri")
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
          <h2 className="text-2xl font-bold text-foreground">Lập kế hoạch bảo trì định kỳ</h2>
          <p className="text-sm text-muted-foreground">Quản lý kế hoạch bảo trì theo chu kỳ</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { resetForm(); setEditingItem(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Tạo kế hoạch mới
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Chỉnh sửa kế hoạch" : "Tạo kế hoạch mới"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã tài sản *</Label>
                  <Input value={form.mataisan} onChange={(e) => setForm({ ...form, mataisan: e.target.value })} placeholder="VD: 101" />
                </div>
                <div className="space-y-2">
                  <Label>Ngày bảo trì *</Label>
                  <Input type="date" value={form.ngaybaotri} onChange={(e) => setForm({ ...form, ngaybaotri: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chu kỳ *</Label>
                  <Select value={form.chuky} onValueChange={(v) => setForm({ ...form, chuky: v as ChuKyBaoTri })}>
                    <SelectTrigger><SelectValue placeholder="Chọn chu kỳ" /></SelectTrigger>
                    <SelectContent>
                      {["Hàng tuần", "Hàng tháng", "Hàng quý", "Hàng năm"].map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Người phụ trách *</Label>
                  <Input value={form.nguoiphutrach} onChange={(e) => setForm({ ...form, nguoiphutrach: e.target.value })} placeholder="VD: 5" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trạng thái *</Label>
                <Select value={form.trangthai} onValueChange={(v) => setForm({ ...form, trangthai: v as string })}>
                  <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                  <SelectContent>
                    {Object.values(trangThaiMap).map((v) => (
                      <SelectItem key={v.label} value={v.label}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Hủy</Button>
              <Button onClick={handleSubmit}>{editingItem ? "Cập nhật" : "Lưu kế hoạch"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm theo mã, tên tài sản, người phụ trách..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9" />
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
                <TableHead className="w-40">Ngày bảo trì</TableHead>
                <TableHead className="w-32">Chu kỳ</TableHead>
                <TableHead className="w-56">Người phụ trách</TableHead>
                <TableHead className="w-44">Trạng thái</TableHead>
                <TableHead className="text-center w-24">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((p, idx) => (
                <TableRow key={p.makehoach}>
                  <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                  <TableCell className="font-mono font-medium">{p.macode}</TableCell>
                  <TableCell className="font-mono">#{p.mataisan}</TableCell>
                  <TableCell className="font-medium">{p.tentaisan}</TableCell>
                  <TableCell>{p.ngaybaotri}</TableCell>
                  <TableCell>{p.chuky}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {p.hoten}
                    </div>
                  </TableCell>
                  <TableCell>
                  {trangThaiMap[p.trangthai] ? (
                    <Badge variant={trangThaiMap[p.trangthai].variant}>
                      {trangThaiMap[p.trangthai].label}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Không xác định</Badge>
                  )}
                </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteItem(p)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    Không tìm thấy kế hoạch bảo trì nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Hiển thị {paged.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length} kế hoạch
          </p>
          {/* Pagination buttons giữ nguyên như cũ */}
        </div>
      </div>

      {/* AlertDialog xóa giữ nguyên */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoa kế hoạch bảo trì</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa kế hoạch bảo trì cho tài sản "{deleteItem?.tentaisan}" không? Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

export default PeriodicMaintenancePlanning;
