import AppHeader from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type MucDoSuCo = "Thấp" | "Trung bình" | "Cao" | "Khẩn cấp";
type TrangThaiSuCo = "Chưa xử lý" | "Đang xử lý" | "Đã xử lý" | "Tạm hoãn";

interface SuCoTaiSan {
  MaSuCo: number;
  MaTaiSan: number;
  MoTaSuCo: string;
  MucDo: MucDoSuCo;
  NgayXayRa: string; // yyyy-mm-dd
  TrangThai: TrangThaiSuCo;
}

const initialData: SuCoTaiSan[] = [
  {
    MaSuCo: 1,
    MaTaiSan: 101,
    MoTaSuCo: "Máy bơm bị rò rỉ",
    MucDo: "Cao",
    NgayXayRa: "2026-04-01",
    TrangThai: "Chưa xử lý",
  },
];

const mucDoVariant: Record<MucDoSuCo, "default" | "secondary" | "destructive" | "outline"> =
  {
    Thấp: "outline",
    "Trung bình": "secondary",
    Cao: "default",
    "Khẩn cấp": "destructive",
  };

const trangThaiVariant: Record<
  TrangThaiSuCo,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "Chưa xử lý": "outline",
  "Đang xử lý": "secondary",
  "Đã xử lý": "default",
  "Tạm hoãn": "destructive",
};

const ITEMS_PER_PAGE = 5;

function AssetIncidentRecording() {
  const [data, setData] = useState<SuCoTaiSan[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SuCoTaiSan | null>(null);
  const [deleteItem, setDeleteItem] = useState<SuCoTaiSan | null>(null);

  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");

  const emptyForm = useMemo(
    () => ({
      MaTaiSan: "",
      MoTaSuCo: "",
      MucDo: "Cao" as MucDoSuCo,
      NgayXayRa: new Date().toISOString().slice(0, 10),
      TrangThai: "Chưa xử lý" as TrangThaiSuCo,
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  const filtered = data.filter((i) => {
    const q = search.toLowerCase();
    return (
      String(i.MaTaiSan).includes(q) ||
      i.MoTaSuCo.toLowerCase().includes(q) ||
      i.MucDo.toLowerCase().includes(q) ||
      i.TrangThai.toLowerCase().includes(q)
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

  const handleEdit = (item: SuCoTaiSan) => {
    setEditingItem(item);
    setForm({
      MaTaiSan: String(item.MaTaiSan),
      MoTaSuCo: item.MoTaSuCo,
      MucDo: item.MucDo,
      NgayXayRa: item.NgayXayRa,
      TrangThai: item.TrangThai,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.MaTaiSan ||
      !String(form.MaTaiSan).trim() ||
      !form.MoTaSuCo.trim() ||
      !form.MucDo ||
      !form.NgayXayRa ||
      !form.TrangThai
    ) {
      setFormError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    const item: SuCoTaiSan = {
      MaSuCo: editingItem
        ? editingItem.MaSuCo
        : Math.max(...data.map((d) => d.MaSuCo), 0) + 1,
      MaTaiSan: Number(form.MaTaiSan),
      MoTaSuCo: form.MoTaSuCo.trim(),
      MucDo: form.MucDo,
      NgayXayRa: form.NgayXayRa,
      TrangThai: form.TrangThai,
    };

    if (editingItem) {
      setData(data.map((d) => (d.MaSuCo === item.MaSuCo ? item : d)));
      void axios
        .put(`http://localhost:3000/suCoTaiSan/${item.MaSuCo}`, item)
        .catch(() => {});
    } else {
      setData([...data, item]);
      setCurrentPage(1);
      void axios.post("http://localhost:3000/suCoTaiSan", item).catch(() => {});
    }

    resetForm();
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    const toDelete = deleteItem;
    setData(data.filter((d) => d.MaSuCo !== toDelete.MaSuCo));
    setDeleteItem(null);
    void axios
      .delete(`http://localhost:3000/suCoTaiSan/${toDelete.MaSuCo}`)
      .catch(() => {});
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/suCoTaiSan")
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
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Ghi nhận sự cố tài sản
              </h2>
              <p className="text-sm text-muted-foreground">
                Quản lý các sự cố phát sinh liên quan đến tài sản
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
                  className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                >
                  <Plus className="h-4 w-4" /> Ghi nhận sự cố mới
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Sửa sự cố" : "Ghi nhận sự cố mới"}
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
                        value={form.MaTaiSan}
                        onChange={(e) =>
                          setForm({ ...form, MaTaiSan: e.target.value })
                        }
                        placeholder="VD: 101"
                        inputMode="numeric"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Ngày xảy ra *</Label>
                      <Input
                        type="date"
                        value={form.NgayXayRa}
                        onChange={(e) =>
                          setForm({ ...form, NgayXayRa: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Mô tả sự cố *</Label>
                    <textarea
                      className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      rows={4}
                      value={form.MoTaSuCo}
                      onChange={(e) =>
                        setForm({ ...form, MoTaSuCo: e.target.value })
                      }
                      placeholder="Nhập mô tả chi tiết sự cố"
                      maxLength={1000}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Mức độ *</Label>
                      <Select
                        value={form.MucDo}
                        onValueChange={(v) =>
                          setForm({ ...form, MucDo: v as MucDoSuCo })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mức độ" />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            ["Thấp", "Trung bình", "Cao", "Khẩn cấp"] as const
                          ).map((v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Trạng thái *</Label>
                      <Select
                        value={form.TrangThai}
                        onValueChange={(v) =>
                          setForm({ ...form, TrangThai: v as TrangThaiSuCo })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            ["Chưa xử lý", "Đang xử lý", "Đã xử lý", "Tạm hoãn"] as const
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
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {editingItem ? "Lưu thay đổi" : "Ghi nhận"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã tài sản, mô tả, mức độ, trạng thái..."
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
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="w-28">Mức độ</TableHead>
                  <TableHead className="w-36">Ngày</TableHead>
                  <TableHead className="w-40">Trạng thái</TableHead>
                  <TableHead className="text-center w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((item, idx) => (
                  <TableRow key={item.MaSuCo}>
                    <TableCell>
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      #{item.MaTaiSan}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.MoTaSuCo}
                    </TableCell>
                    <TableCell>
                      <Badge variant={mucDoVariant[item.MucDo]}>
                        {item.MucDo}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.NgayXayRa}</TableCell>
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
                      Không tìm thấy sự cố nào
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
                {filtered.length} sự cố
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
                <AlertDialogTitle>Xác nhận xóa sự cố</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa sự cố của tài sản{" "}
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
        </main>
      </div>
    </div>
  );
}

export default AssetIncidentRecording;
