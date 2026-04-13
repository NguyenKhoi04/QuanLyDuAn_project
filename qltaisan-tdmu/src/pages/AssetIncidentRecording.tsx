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
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type MucDoSuCo = "Thấp" | "Trung bình" | "Cao" | "Khẩn cấp";
type TrangThaiSuCo = "Chưa xử lý" | "Đang xử lý" | "Đã xử lý" | "Tạm hoãn";

interface SuCoTaiSan {
  masuco: number;
  mataisan: number;
  macode: string;           // từ taisan
  tentaisan: string;        // từ taisan
  motasuco: string;
  mucdo: MucDoSuCo;
  ngayxayra: string;
  trangthai: TrangThaiSuCo;
}

const mucDoVariant: Record<MucDoSuCo, "default" | "secondary" | "destructive" | "outline"> = {
  Thấp: "outline",
  "Trung bình": "secondary",
  Cao: "default",
  "Khẩn cấp": "destructive",
};

const trangThaiVariant: Record<TrangThaiSuCo, "default" | "secondary" | "destructive" | "outline"> = {
  "Chưa xử lý": "outline",
  "Đang xử lý": "secondary",
  "Đã xử lý": "default",
  "Tạm hoãn": "destructive",
};

const ITEMS_PER_PAGE = 5;

function AssetIncidentRecording() {
  const [data, setData] = useState<SuCoTaiSan[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SuCoTaiSan | null>(null);
  const [deleteItem, setDeleteItem] = useState<SuCoTaiSan | null>(null);
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");

  const emptyForm = useMemo(
    () => ({
      mataisan: "",
      motasuco: "",
      mucdo: "Cao" as MucDoSuCo,
      ngayxayra: new Date().toISOString().slice(0, 10),
      trangthai: "Chưa xử lý" as TrangThaiSuCo,
    }),
    []
  );

  const [form, setForm] = useState(emptyForm);

  // ====================== FETCH DATA ======================
  const fetchSuCo = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sucotaisan")
      .select(`
        masuco,
        mataisan,
        motasuco,
        mucdo,
        ngayxayra,
        trangthai,
        taisan (
          macode,
          tentaisan
        )
      `)
      .order("ngayxayra", { ascending: false });

    if (error) {
      console.error("Lỗi lấy sự cố:", error);
    } else {
      const mapped = data?.map((item: any) => ({
        masuco: item.masuco,
        mataisan: item.mataisan,
        macode: item.taisan?.macode || "N/A",
        tentaisan: item.taisan?.tentaisan || "Không tìm thấy",
        motasuco: item.motasuco,
        mucdo: item.mucdo,
        ngayxayra: item.ngayxayra,
        trangthai: item.trangthai,
      })) || [];
      setData(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuCo();
  }, []);

  // ====================== FILTER ======================
  const filtered = data.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.macode.toLowerCase().includes(q) ||
      i.tentaisan.toLowerCase().includes(q) ||
      i.motasuco.toLowerCase().includes(q) ||
      i.mucdo.toLowerCase().includes(q) ||
      i.trangthai.toLowerCase().includes(q)
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
    if (!form.mataisan || !form.motasuco.trim() || !form.ngayxayra) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    const payload = {
      mataisan: Number(form.mataisan),
      motasuco: form.motasuco.trim(),
      mucdo: form.mucdo,
      ngayxayra: form.ngayxayra,
      trangthai: form.trangthai,
    };

    if (editingItem) {
      await supabase.from("sucotaisan").update(payload).eq("masuco", editingItem.masuco);
    } else {
      await supabase.from("sucotaisan").insert([payload]);
    }

    resetForm();
    setDialogOpen(false);
    setEditingItem(null);
    fetchSuCo();
  };

  const handleEdit = (item: SuCoTaiSan) => {
    setEditingItem(item);
    setForm({
      mataisan: String(item.mataisan),
      motasuco: item.motasuco,
      mucdo: item.mucdo,
      ngayxayra: item.ngayxayra,
      trangthai: item.trangthai,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await supabase.from("sucotaisan").delete().eq("masuco", deleteItem.masuco);
    setDeleteItem(null);
    fetchSuCo();
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Ghi nhận sự cố tài sản
          </h2>
          <p className="text-sm text-muted-foreground">
            Quản lý các sự cố phát sinh liên quan đến tài sản
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { resetForm(); setEditingItem(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
              <Plus className="h-4 w-4" /> Ghi nhận sự cố mới
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Sửa sự cố" : "Ghi nhận sự cố mới"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã tài sản *</Label>
                  <Input
                    type="number"
                    value={form.mataisan}
                    onChange={(e) => setForm({ ...form, mataisan: e.target.value })}
                    placeholder="VD: 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngày xảy ra *</Label>
                  <Input
                    type="date"
                    value={form.ngayxayra}
                    onChange={(e) => setForm({ ...form, ngayxayra: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mô tả sự cố *</Label>
                <textarea
                  className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={4}
                  value={form.motasuco}
                  onChange={(e) => setForm({ ...form, motasuco: e.target.value })}
                  placeholder="Nhập mô tả chi tiết sự cố..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mức độ *</Label>
                  <Select value={form.mucdo} onValueChange={(v) => setForm({ ...form, mucdo: v as MucDoSuCo })}>
                    <SelectTrigger><SelectValue placeholder="Chọn mức độ" /></SelectTrigger>
                    <SelectContent>
                      {["Thấp", "Trung bình", "Cao", "Khẩn cấp"].map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Trạng thái *</Label>
                  <Select value={form.trangthai} onValueChange={(v) => setForm({ ...form, trangthai: v as TrangThaiSuCo })}>
                    <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                    <SelectContent>
                      {["Chưa xử lý", "Đang xử lý", "Đã xử lý", "Tạm hoãn"].map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Hủy</Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSubmit}>
                {editingItem ? "Lưu thay đổi" : "Ghi nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo mã, tên tài sản, mô tả..."
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
                <TableHead>Mô tả</TableHead>
                <TableHead className="w-28">Mức độ</TableHead>
                <TableHead className="w-36">Ngày</TableHead>
                <TableHead className="w-40">Trạng thái</TableHead>
                <TableHead className="text-center w-24">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((item, idx) => (
                <TableRow key={item.masuco}>
                  <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                  <TableCell className="font-mono font-medium">{item.macode}</TableCell>
                  <TableCell className="font-mono">{item.mataisan}</TableCell>
                  <TableCell className="font-medium">{item.tentaisan}</TableCell>
                  <TableCell>
                    <Badge variant={mucDoVariant[item.mucdo]}>{item.mucdo}</Badge>
                  </TableCell>
                  <TableCell>{item.ngayxayra}</TableCell>
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
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    Không tìm thấy sự cố nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Hiển thị {paged.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length} sự cố
          </p>
          {/* Pagination buttons (giữ nguyên code cũ của bạn) */}
        </div>
      </div>

      {/* AlertDialog xóa */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        {/* Giữ nguyên code AlertDialog của bạn */}
      </AlertDialog>
    </AppShell>
  );
}

export default AssetIncidentRecording;