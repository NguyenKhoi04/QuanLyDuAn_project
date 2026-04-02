import AppHeader from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,DialogTrigger} from "@/components/ui/dialog";
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Search,Plus,Edit,Trash2,ChevronLeft,ChevronRight} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
const loaiTaiSan: Record<number, string> = {
  1: "Máy tính",
  2: "Bàn ghế",
  3: "Máy chiếu",
  4: "Thiết bị mạng",
  5: "Điều hòa",
};

const phongBan: Record<number, string> = {
  1: "Phòng CNTT",
  2: "Phòng Kế toán",
  3: "Phòng Nhân sự",
  4: "Khoa CNTT",
  5: "Khoa Kinh tế",
};

const viTri: Record<number, string> = {
  1: "Tầng 1 - P101",
  2: "Tầng 1 - P102",
  3: "Tầng 2 - P201",
  4: "Tầng 2 - P202",
  5: "Tầng 3 - P301",
};

const nhaCungCap: Record<number, string> = {
  1: "Công ty ABC",
  2: "Công ty XYZ",
  3: "Công ty DEF",
  4: "Công ty GHI",
};

const trangThaiMap: Record<
  number,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  1: { label: "Đang sử dụng", variant: "default" },
  2: { label: "Chờ cấp phát", variant: "secondary" },
  3: { label: "Đang sửa chữa", variant: "outline" },
  4: { label: "Thanh lý", variant: "destructive" },
};

interface TaiSan {
  MaTaiSan: number;
  MaTS: string;
  TenTaiSan: string;
  MaLoai: number;
  MaPhongBan: number;
  MaViTri: number;
  MaNhaCungCap: number | null;
  NgayMua: string | null;
  TrangThai: number;
}

const initialData: TaiSan[] = [
  {
    MaTaiSan: 1,
    MaTS: "TS001",
    TenTaiSan: "Máy tính Dell Vostro 3510",
    MaLoai: 1,
    MaPhongBan: 1,
    MaViTri: 1,
    MaNhaCungCap: 1,
    NgayMua: "2023-03-15",
    TrangThai: 1,
  },
  {
    MaTaiSan: 2,
    MaTS: "TS002",
    TenTaiSan: "Máy tính HP ProBook 450",
    MaLoai: 1,
    MaPhongBan: 4,
    MaViTri: 3,
    MaNhaCungCap: 2,
    NgayMua: "2023-05-20",
    TrangThai: 1,
  },
  {
    MaTaiSan: 3,
    MaTS: "TS003",
    TenTaiSan: "Bàn làm việc 1m2",
    MaLoai: 2,
    MaPhongBan: 2,
    MaViTri: 2,
    MaNhaCungCap: 3,
    NgayMua: "2022-11-10",
    TrangThai: 1,
  },
  {
    MaTaiSan: 4,
    MaTS: "TS004",
    TenTaiSan: "Ghế xoay văn phòng",
    MaLoai: 2,
    MaPhongBan: 3,
    MaViTri: 4,
    MaNhaCungCap: 3,
    NgayMua: "2022-11-10",
    TrangThai: 2,
  },
  {
    MaTaiSan: 5,
    MaTS: "TS005",
    TenTaiSan: "Máy chiếu Epson EB-X51",
    MaLoai: 3,
    MaPhongBan: 4,
    MaViTri: 3,
    MaNhaCungCap: 1,
    NgayMua: "2024-01-08",
    TrangThai: 1,
  },
  {
    MaTaiSan: 6,
    MaTS: "TS006",
    TenTaiSan: "Switch Cisco 24 port",
    MaLoai: 4,
    MaPhongBan: 1,
    MaViTri: 1,
    MaNhaCungCap: 2,
    NgayMua: "2023-07-22",
    TrangThai: 3,
  },
  {
    MaTaiSan: 7,
    MaTS: "TS007",
    TenTaiSan: "Điều hòa Daikin 12000BTU",
    MaLoai: 5,
    MaPhongBan: 5,
    MaViTri: 5,
    MaNhaCungCap: 4,
    NgayMua: "2021-06-15",
    TrangThai: 4,
  },
  {
    MaTaiSan: 8,
    MaTS: "TS008",
    TenTaiSan: "Máy tính Lenovo ThinkPad",
    MaLoai: 1,
    MaPhongBan: 2,
    MaViTri: 2,
    MaNhaCungCap: 1,
    NgayMua: "2024-02-28",
    TrangThai: 2,
  },
  {
    MaTaiSan: 9,
    MaTS: "TS009",
    TenTaiSan: "Router WiFi TP-Link",
    MaLoai: 4,
    MaPhongBan: 1,
    MaViTri: 1,
    MaNhaCungCap: 2,
    NgayMua: "2023-09-05",
    TrangThai: 1,
  },
  {
    MaTaiSan: 10,
    MaTS: "TS010",
    TenTaiSan: "Máy chiếu BenQ MH560",
    MaLoai: 3,
    MaPhongBan: 5,
    MaViTri: 5,
    MaNhaCungCap: 4,
    NgayMua: null,
    TrangThai: 2,
  },
];

const ITEMS_PER_PAGE = 5;

function AssetList() {
  const [data, setData] = useState<TaiSan[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaiSan | null>(null);
  const [deleteItem, setDeleteItem] = useState<TaiSan | null>(null);

  const [search, setSearch] = useState("");

  const emptyForm = {
    MaTS: "",
    TenTaiSan: "",
    MaLoai: "",
    MaPhongBan: "",
    MaViTri: "",
    MaNhaCungCap: "",
    NgayMua: "",
    TrangThai: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const filtered = data.filter(
    (ts) =>
      ts.TenTaiSan.toLowerCase().includes(search.toLowerCase()) ||
      ts.MaTS.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  const resetForm = () => {
    setForm(emptyForm);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.MaTS.trim() ||
      !form.TenTaiSan.trim() ||
      !form.MaLoai ||
      !form.MaPhongBan ||
      !form.MaViTri ||
      !form.TrangThai
    ) {
      setFormError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }
    const item: TaiSan = {
      MaTaiSan: editingItem
        ? editingItem.MaTaiSan
        : Math.max(...data.map((d) => d.MaTaiSan), 0) + 1,
      MaTS: form.MaTS.trim(),
      TenTaiSan: form.TenTaiSan.trim(),
      MaLoai: Number(form.MaLoai),
      MaPhongBan: Number(form.MaPhongBan),
      MaViTri: Number(form.MaViTri),
      MaNhaCungCap: form.MaNhaCungCap ? Number(form.MaNhaCungCap) : null,
      NgayMua: form.NgayMua || null,
      TrangThai: Number(form.TrangThai),
    };
    if (editingItem) {
      setData(
        data.map((d) => (d.MaTaiSan === editingItem.MaTaiSan ? item : d)),
      );
    } else {
      setData([...data, item]);
      setCurrentPage(1);
    }
    resetForm();
    setDialogOpen(false);
  };
  const handleEdit = (ts: TaiSan) => {
    setEditingItem(ts);
    setForm({
      MaTS: ts.MaTS,
      TenTaiSan: ts.TenTaiSan,
      MaLoai: String(ts.MaLoai),
      MaPhongBan: String(ts.MaPhongBan),
      MaViTri: String(ts.MaViTri),
      MaNhaCungCap: ts.MaNhaCungCap ? String(ts.MaNhaCungCap) : "",
      NgayMua: ts.NgayMua ?? "",
      TrangThai: String(ts.TrangThai),
    });
    setFormError("");
    setDialogOpen(true);
  };
  const handleDelete = () => {
    if (deleteItem) {
      setData(data.filter((d) => d.MaTaiSan !== deleteItem.MaTaiSan));
      setDeleteItem(null);
    }
  };
  // Reset page when search changes
  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  useEffect(() => {
    axios.get("http://localhost:3000/assets").then((res) => setData(res.data));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1 min-h-0">
        <AppSidebar />
        <main className="flex-1 min-h-0 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Danh sách tài sản
            </h2>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" /> Thêm tài sản
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Chỉnh sửa tài sản" : "Thêm tài sản mới"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Mã Tài sản *</Label>
                      <Input
                        value={form.MaTS}
                        onChange={(e) =>
                          setForm({ ...form, MaTS: e.target.value })
                        }
                        placeholder="VD: TS011"
                        maxLength={50}
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
                        maxLength={100}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Loại tài sản *</Label>
                      <Select
                        value={form.MaLoai}
                        onValueChange={(v) => setForm({ ...form, MaLoai: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(loaiTaiSan).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Phòng ban *</Label>
                      <Select
                        value={form.MaPhongBan}
                        onValueChange={(v) =>
                          setForm({ ...form, MaPhongBan: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(phongBan).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vị trí *</Label>
                      <Select
                        value={form.MaViTri}
                        onValueChange={(v) => setForm({ ...form, MaViTri: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vị trí" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(viTri).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nhà cung cấp</Label>
                      <Select
                        value={form.MaNhaCungCap}
                        onValueChange={(v) =>
                          setForm({ ...form, MaNhaCungCap: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn NCC" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(nhaCungCap).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày mua</Label>
                      <Input
                        type="date"
                        value={form.NgayMua}
                        onChange={(e) =>
                          setForm({ ...form, NgayMua: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Trạng thái *</Label>
                      <Select
                        value={form.TrangThai}
                        onValueChange={(v) =>
                          setForm({ ...form, TrangThai: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(trangThaiMap).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v.label}
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
                    {editingItem ? "Cập nhật" : "Lưu tài sản"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc mã..."
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
                  <TableHead>Mã Tài sản</TableHead>
                  <TableHead>Tên tài sản</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Ngày mua</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((ts, idx) => {
                  const tt = trangThaiMap[ts.TrangThai];
                  return (
                    <TableRow key={ts.MaTaiSan}>
                      <TableCell>
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {ts.MaTS}
                      </TableCell>
                      <TableCell className="font-medium">
                        {ts.TenTaiSan}
                      </TableCell>
                      <TableCell>{loaiTaiSan[ts.MaLoai]}</TableCell>
                      <TableCell>{phongBan[ts.MaPhongBan]}</TableCell>
                      <TableCell>{viTri[ts.MaViTri]}</TableCell>
                      <TableCell>
                        {ts.MaNhaCungCap ? nhaCungCap[ts.MaNhaCungCap] : "—"}
                      </TableCell>
                      <TableCell>{ts.NgayMua ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={tt.variant}>{tt.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(ts)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteItem(ts)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không tìm thấy tài sản nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Hiển thị{" "}
                {paged.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} /{" "}
                {filtered.length} tài sản
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
          {/* Delete confirmation */}
          <AlertDialog
            open={!!deleteItem}
            onOpenChange={(open) => {
              if (!open) setDeleteItem(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa tài sản</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa tài sản{" "}
                  <strong>{deleteItem?.TenTaiSan}</strong> ({deleteItem?.MaTS}
                  )? Hành động này không thể hoàn tác.
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

export default AssetList;
