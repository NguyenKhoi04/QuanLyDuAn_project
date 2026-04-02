import AppHeader from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
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
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

type ChuKyBaoTri = "Hàng tuần" | "Hàng tháng" | "Hàng quý" | "Hàng năm";

type TrangThaiKeHoach =
  | "Đang lên kế hoạch"
  | "Sẵn sàng"
  | "Đang thực hiện"
  | "Hoàn thành"
  | "Tạm hoãn";

interface KeHoachBaoTri {
  MaKeHoach: number;
  MaTaiSan: number;
  TenTaiSan: string;
  NgayBaoTri: string; // yyyy-mm-dd
  ChuKy: ChuKyBaoTri;
  NguoiPhuTrach: string;
  TrangThai: TrangThaiKeHoach;
}

const initialData: KeHoachBaoTri[] = [
  {
    MaKeHoach: 1,
    MaTaiSan: 101,
    TenTaiSan: "Máy bơm nước",
    NgayBaoTri: "2026-04-15",
    ChuKy: "Hàng tháng",
    NguoiPhuTrach: "Nguyễn Văn A",
    TrangThai: "Đang lên kế hoạch",
  },
  {
    MaKeHoach: 2,
    MaTaiSan: 102,
    TenTaiSan: "Hệ thống HVAC",
    NgayBaoTri: "2026-05-01",
    ChuKy: "Hàng quý",
    NguoiPhuTrach: "Trần Thị B",
    TrangThai: "Sẵn sàng",
  },
];

const trangThaiVariant: Record<
  TrangThaiKeHoach,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "Đang lên kế hoạch": "outline",
  "Sẵn sàng": "default",
  "Đang thực hiện": "secondary",
  "Hoàn thành": "default",
  "Tạm hoãn": "destructive",
};

const ITEMS_PER_PAGE = 5;

function PeriodicMaintenancePlanning() {
  const [data, setData] = useState<KeHoachBaoTri[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KeHoachBaoTri | null>(null);
  const [deleteItem, setDeleteItem] = useState<KeHoachBaoTri | null>(null);

  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");

  const emptyForm = useMemo(
    () => ({
      MaTaiSan: "",
      TenTaiSan: "",
      NgayBaoTri: "",
      ChuKy: "" as "" | ChuKyBaoTri,
      NguoiPhuTrach: "",
      TrangThai: "" as "" | TrangThaiKeHoach,
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  const filtered = data.filter((p) => {
    const q = search.toLowerCase();
    return (
      String(p.MaTaiSan).includes(q) ||
      p.TenTaiSan.toLowerCase().includes(q) ||
      p.NguoiPhuTrach.toLowerCase().includes(q) ||
      p.TrangThai.toLowerCase().includes(q)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.MaTaiSan ||
      !form.TenTaiSan.trim() ||
      !form.NgayBaoTri ||
      !form.ChuKy ||
      !form.NguoiPhuTrach.trim() ||
      !form.TrangThai
    ) {
      setFormError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    const item: KeHoachBaoTri = {
      MaKeHoach: editingItem
        ? editingItem.MaKeHoach
        : Math.max(...data.map((d) => d.MaKeHoach), 0) + 1,
      MaTaiSan: Number(form.MaTaiSan),
      TenTaiSan: form.TenTaiSan.trim(),
      NgayBaoTri: form.NgayBaoTri,
      ChuKy: form.ChuKy,
      NguoiPhuTrach: form.NguoiPhuTrach.trim(),
      TrangThai: form.TrangThai,
    };

    if (editingItem) {
      setData(data.map((d) => (d.MaKeHoach === item.MaKeHoach ? item : d)));
      void axios
        .put(`http://localhost:3000/keHoachBaoTri/${item.MaKeHoach}`, item)
        .catch(() => {});
    } else {
      setData([...data, item]);
      setCurrentPage(1);
      void axios.post("http://localhost:3000/keHoachBaoTri", item).catch(() => {
        // keep local state if api is unavailable
      });
    }

    resetForm();
    setDialogOpen(false);
  };

  const handleEdit = (p: KeHoachBaoTri) => {
    setEditingItem(p);
    setForm({
      MaTaiSan: String(p.MaTaiSan),
      TenTaiSan: p.TenTaiSan,
      NgayBaoTri: p.NgayBaoTri,
      ChuKy: p.ChuKy,
      NguoiPhuTrach: p.NguoiPhuTrach,
      TrangThai: p.TrangThai,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    const toDelete = deleteItem;
    setData(data.filter((d) => d.MaKeHoach !== toDelete.MaKeHoach));
    setDeleteItem(null);
    void axios
      .delete(`http://localhost:3000/keHoachBaoTri/${toDelete.MaKeHoach}`)
      .catch(() => {});
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
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1 min-h-0">
        <AppSidebar />
        <main className="flex-1 min-h-0 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Lập kế hoạch bảo trì định kỳ
              </h2>
              <p className="text-sm text-muted-foreground">
                Quản lý lập kế hoạch bảo trì định kỳ (bảng KeHoachBaoTri)
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
                  className="bg-primary text-primary-foreground gap-2"
                >
                  <Plus className="h-4 w-4" /> Tạo kế hoạch mới
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Chỉnh sửa kế hoạch" : "Tạo kế hoạch mới"}
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
                        value={form.MaTaiSan}
                        onChange={(e) =>
                          setForm({ ...form, MaTaiSan: e.target.value })
                        }
                        placeholder="VD: 101"
                        inputMode="numeric"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tên tài sản *</Label>
                      <Input
                        value={form.TenTaiSan}
                        onChange={(e) =>
                          setForm({ ...form, TenTaiSan: e.target.value })
                        }
                        placeholder="Nhập tên tài sản"
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày bảo trì *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          className="pl-9"
                          value={form.NgayBaoTri}
                          onChange={(e) =>
                            setForm({ ...form, NgayBaoTri: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Chu kỳ *</Label>
                      <Select
                        value={form.ChuKy}
                        onValueChange={(v) =>
                          setForm({ ...form, ChuKy: v as ChuKyBaoTri })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chu kỳ" />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            ["Hàng tuần", "Hàng tháng", "Hàng quý", "Hàng năm"] as const
                          ).map((v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Người phụ trách *</Label>
                      <Input
                        value={form.NguoiPhuTrach}
                        onChange={(e) =>
                          setForm({ ...form, NguoiPhuTrach: e.target.value })
                        }
                        placeholder="VD: Nguyễn Văn A"
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Trạng thái *</Label>
                      <Select
                        value={form.TrangThai}
                        onValueChange={(v) =>
                          setForm({ ...form, TrangThai: v as TrangThaiKeHoach })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            [
                              "Đang lên kế hoạch",
                              "Sẵn sàng",
                              "Đang thực hiện",
                              "Hoàn thành",
                              "Tạm hoãn",
                            ] as const
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
                  <Button onClick={handleSubmit}>
                    {editingItem ? "Cập nhật" : "Lưu kế hoạch"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã tài sản, tên, người phụ trách, trạng thái..."
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
                  <TableRow key={p.MaKeHoach}>
                    <TableCell>
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      #{p.MaTaiSan}
                    </TableCell>
                    <TableCell className="font-medium">{p.TenTaiSan}</TableCell>
                    <TableCell>{p.NgayBaoTri}</TableCell>
                    <TableCell>{p.ChuKy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{p.NguoiPhuTrach}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={trangThaiVariant[p.TrangThai]}>
                        {p.TrangThai}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(p)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteItem(p)}
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
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không tìm thấy kế hoạch bảo trì nào
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
                {filtered.length} kế hoạch
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
                <AlertDialogTitle>Xác nhận xóa kế hoạch</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa kế hoạch bảo trì của{" "}
                  <strong>{deleteItem?.TenTaiSan}</strong> (Mã TS:{" "}
                  <strong>{deleteItem?.MaTaiSan}</strong>)? Hành động này không
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
        </main>
      </div>
    </div>
  );
}

export default PeriodicMaintenancePlanning;
