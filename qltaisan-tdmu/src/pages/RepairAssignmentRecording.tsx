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

type TrangThaiPhanCong = "Đang chờ" | "Đang sửa" | "Hoàn thành" | "Hủy";

interface PhanCongSuaChua {
  MaPhanCong: number;
  MaTaiSan: number;
  MaNguoiSua: number;
  TenNguoiSua?: string;
  NgayDuKienHoanThanh: string; // yyyy-mm-dd
  TrangThai: TrangThaiPhanCong;
}

const nguoiSuaMau = [
  { id: 1, name: "Nguyễn Văn A" },
  { id: 2, name: "Trần Thị B" },
];

const initialData: PhanCongSuaChua[] = [
  {
    MaPhanCong: 1,
    MaTaiSan: 101,
    MaNguoiSua: 1,
    TenNguoiSua: "Nguyễn Văn A",
    NgayDuKienHoanThanh: "2026-04-10",
    TrangThai: "Đang chờ",
  },
];

const trangThaiVariant: Record<
  TrangThaiPhanCong,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "Đang chờ": "outline",
  "Đang sửa": "secondary",
  "Hoàn thành": "default",
  Hủy: "destructive",
};

const ITEMS_PER_PAGE = 5;

function RepairAssignmentRecording() {
  const [data, setData] = useState<PhanCongSuaChua[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PhanCongSuaChua | null>(null);
  const [deleteItem, setDeleteItem] = useState<PhanCongSuaChua | null>(null);

  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");

  const emptyForm = useMemo(
    () => ({
      MaTaiSan: "",
      MaNguoiSua: "",
      NgayDuKienHoanThanh: "",
      TrangThai: "Đang chờ" as TrangThaiPhanCong,
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  const filtered = data.filter((a) => {
    const q = search.toLowerCase();
    return (
      String(a.MaTaiSan).includes(q) ||
      String(a.MaNguoiSua).includes(q) ||
      (a.TenNguoiSua ?? "").toLowerCase().includes(q) ||
      a.TrangThai.toLowerCase().includes(q) ||
      a.NgayDuKienHoanThanh.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const resetForm = () => setForm(emptyForm);

  const openCreate = () => {
    setEditingItem(null);
    resetForm();
    setFormError("");
    setDialogOpen(true);
  };

  const handleEdit = (item: PhanCongSuaChua) => {
    setEditingItem(item);
    setForm({
      MaTaiSan: String(item.MaTaiSan),
      MaNguoiSua: String(item.MaNguoiSua),
      NgayDuKienHoanThanh: item.NgayDuKienHoanThanh,
      TrangThai: item.TrangThai,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !String(form.MaTaiSan).trim() ||
      !String(form.MaNguoiSua).trim() ||
      !form.NgayDuKienHoanThanh ||
      !form.TrangThai
    ) {
      setFormError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    const maNguoiSuaNum = Number(form.MaNguoiSua);
    const tenNguoiSua =
      nguoiSuaMau.find((u) => u.id === maNguoiSuaNum)?.name ?? undefined;

    const item: PhanCongSuaChua = {
      MaPhanCong: editingItem
        ? editingItem.MaPhanCong
        : Math.max(...data.map((d) => d.MaPhanCong), 0) + 1,
      MaTaiSan: Number(form.MaTaiSan),
      MaNguoiSua: maNguoiSuaNum,
      TenNguoiSua: tenNguoiSua,
      NgayDuKienHoanThanh: form.NgayDuKienHoanThanh,
      TrangThai: form.TrangThai,
    };

    if (editingItem) {
      setData(data.map((d) => (d.MaPhanCong === item.MaPhanCong ? item : d)));
      void axios
        .put(`http://localhost:3000/phanCongSuaChua/${item.MaPhanCong}`, item)
        .catch(() => {});
    } else {
      setData([...data, item]);
      setCurrentPage(1);
      void axios
        .post("http://localhost:3000/phanCongSuaChua", item)
        .catch(() => {});
    }

    resetForm();
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    const toDelete = deleteItem;
    setData(data.filter((d) => d.MaPhanCong !== toDelete.MaPhanCong));
    setDeleteItem(null);
    void axios
      .delete(`http://localhost:3000/phanCongSuaChua/${toDelete.MaPhanCong}`)
      .catch(() => {});
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
                Ghi nhận đảm nhận sửa chữa
              </h2>
              <p className="text-sm text-muted-foreground">
                Phân công người sửa chữa cho tài sản và theo dõi tiến độ
              </p>
            </div>

            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setEditingItem(null);
                  resetForm();
                  setFormError("");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={openCreate}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <Plus className="h-4 w-4" /> Phân công mới
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Chỉnh sửa phân công" : "Phân công sửa chữa"}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Mã tài sản *</Label>
                      <Input
                        type="number"
                        placeholder="VD: 101"
                        value={form.MaTaiSan}
                        onChange={(e) =>
                          setForm({ ...form, MaTaiSan: e.target.value })
                        }
                        inputMode="numeric"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Người sửa *</Label>
                      <Select
                        value={form.MaNguoiSua}
                        onValueChange={(v) =>
                          setForm({ ...form, MaNguoiSua: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn người sửa" />
                        </SelectTrigger>
                        <SelectContent>
                          {nguoiSuaMau.map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày dự kiến hoàn thành *</Label>
                      <Input
                        type="date"
                        value={form.NgayDuKienHoanThanh}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            NgayDuKienHoanThanh: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Trạng thái *</Label>
                      <Select
                        value={form.TrangThai}
                        onValueChange={(v) =>
                          setForm({
                            ...form,
                            TrangThai: v as TrangThaiPhanCong,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            ["Đang chờ", "Đang sửa", "Hoàn thành", "Hủy"] as const
                          ).map((v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setDialogOpen(false);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {editingItem ? "Lưu thay đổi" : "Phân công"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã tài sản, người sửa, trạng thái, ngày..."
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
                  <TableHead className="w-32">Mã người sửa</TableHead>
                  <TableHead>Người sửa</TableHead>
                  <TableHead className="w-44">Dự kiến hoàn thành</TableHead>
                  <TableHead className="w-32">Trạng thái</TableHead>
                  <TableHead className="text-center w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((item, idx) => (
                  <TableRow key={item.MaPhanCong}>
                    <TableCell>
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      #{item.MaTaiSan}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.MaNguoiSua}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.TenNguoiSua ?? "—"}
                    </TableCell>
                    <TableCell>{item.NgayDuKienHoanThanh}</TableCell>
                    <TableCell>
                      <Badge variant={trangThaiVariant[item.TrangThai]}>
                        {item.TrangThai}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteItem(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {paged.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không tìm thấy phân công nào
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
                {filtered.length} phân công
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

          <AlertDialog
            open={!!deleteItem}
            onOpenChange={(open) => {
              if (!open) setDeleteItem(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa phân công</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa phân công sửa chữa cho tài sản{" "}
                  <strong>#{deleteItem?.MaTaiSan}</strong>? Hành động này không
                  thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
    </AppShell>
  );
}

export default RepairAssignmentRecording;
