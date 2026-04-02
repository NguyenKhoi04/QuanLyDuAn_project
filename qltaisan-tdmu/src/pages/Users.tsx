import AppHeader from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const vaiTro: Record<number, string> = {
  1: "Quản trị",
  2: "Quản lý",
  3: "Nhân viên",
};

const phongBan: Record<number, string> = {
  1: "Phòng CNTT",
  2: "Phòng Kế toán",
  3: "Phòng Nhân sự",
  4: "Khoa CNTT",
  5: "Khoa Kinh tế",
};

const trangThaiMap: Record<
  number,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  1: { label: "Đang hoạt động", variant: "default" },
  0: { label: "Ngưng hoạt động", variant: "secondary" },
};

interface NguoiDung {
  MaNguoiDung: number;
  TenDangNhap: string;
  MatKhau: string;
  HoTen: string;
  Email?: string | null;
  MaVaiTro: number;
  MaPhongBan?: number | null;
  TrangThai: number;
}

const initialData: NguoiDung[] = [
  {
    MaNguoiDung: 1,
    TenDangNhap: "admin",
    MatKhau: "admin123",
    HoTen: "Quản trị hệ thống",
    Email: "admin@tdmu.edu.vn",
    MaVaiTro: 1,
    MaPhongBan: 1,
    TrangThai: 1,
  },
  {
    MaNguoiDung: 2,
    TenDangNhap: "manager01",
    MatKhau: "manager123",
    HoTen: "Phan Nguyễn Ngọc Khôi",
    Email: "2224801030082@student.tdmu.edu.vn",
    MaVaiTro: 2,
    MaPhongBan: 2,
    TrangThai: 1,
  },
  {
    MaNguoiDung: 3,
    TenDangNhap: "staff01",
    MatKhau: "staff123",
    HoTen: "Phạm Huỳnh Ngọc Sơn",
    Email: "2324802010339@student.tdmu.edu.vn",
    MaVaiTro: 3,
    MaPhongBan: 3,
    TrangThai: 0,
  },
];

const ITEMS_PER_PAGE = 5;

function Users() {
  const [data, setData] = useState<NguoiDung[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NguoiDung | null>(null);
  const [deleteItem, setDeleteItem] = useState<NguoiDung | null>(null);
  const [search, setSearch] = useState("");

  const emptyForm = useMemo(
    () => ({
      TenDangNhap: "",
      MatKhau: "",
      HoTen: "",
      Email: "",
      MaVaiTro: "",
      MaPhongBan: "",
      TrangThai: "",
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const filtered = data.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.TenDangNhap.toLowerCase().includes(q) ||
      u.HoTen.toLowerCase().includes(q) ||
      (u.Email ?? "").toLowerCase().includes(q)
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

  const resetForm = () => {
    setForm(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.TenDangNhap.trim() ||
      !form.MatKhau.trim() ||
      !form.HoTen.trim() ||
      !form.MaVaiTro ||
      !form.TrangThai
    ) {
      setFormError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    const item: NguoiDung = {
      MaNguoiDung: editingItem
        ? editingItem.MaNguoiDung
        : Math.max(...data.map((d) => d.MaNguoiDung), 0) + 1,
      TenDangNhap: form.TenDangNhap.trim(),
      MatKhau: form.MatKhau.trim(),
      HoTen: form.HoTen.trim(),
      Email: form.Email?.trim() ? form.Email.trim() : null,
      MaVaiTro: Number(form.MaVaiTro),
      MaPhongBan: form.MaPhongBan ? Number(form.MaPhongBan) : null,
      TrangThai: Number(form.TrangThai),
    };

    if (editingItem) {
      setData(
        data.map((d) => (d.MaNguoiDung === editingItem.MaNguoiDung ? item : d)),
      );
    } else {
      setData([...data, item]);
      setCurrentPage(1);
    }

    resetForm();
    setDialogOpen(false);
  };

  const handleEdit = (u: NguoiDung) => {
    setEditingItem(u);
    setForm({
      TenDangNhap: u.TenDangNhap,
      MatKhau: u.MatKhau,
      HoTen: u.HoTen,
      Email: u.Email ?? "",
      MaVaiTro: String(u.MaVaiTro),
      MaPhongBan: u.MaPhongBan ? String(u.MaPhongBan) : "",
      TrangThai: String(u.TrangThai),
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteItem) {
      setData(data.filter((d) => d.MaNguoiDung !== deleteItem.MaNguoiDung));
      setDeleteItem(null);
    }
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/users")
      .then((res) => setData(res.data))
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
            <h2 className="text-2xl font-bold text-foreground">
              Quản lý người dùng
            </h2>
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
                <Button className="bg-primary text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" /> Thêm người dùng
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tên đăng nhập *</Label>
                      <Input
                        value={form.TenDangNhap}
                        onChange={(e) =>
                          setForm({ ...form, TenDangNhap: e.target.value })
                        }
                        placeholder="VD: admin"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mật khẩu *</Label>
                      <Input
                        type="password"
                        value={form.MatKhau}
                        onChange={(e) =>
                          setForm({ ...form, MatKhau: e.target.value })
                        }
                        placeholder="Nhập mật khẩu"
                        maxLength={255}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Họ tên *</Label>
                      <Input
                        value={form.HoTen}
                        onChange={(e) =>
                          setForm({ ...form, HoTen: e.target.value })
                        }
                        placeholder="Nhập họ tên"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={form.Email}
                        onChange={(e) =>
                          setForm({ ...form, Email: e.target.value })
                        }
                        placeholder="VD: user@tdmu.edu.vn"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vai trò *</Label>
                      <Select
                        value={form.MaVaiTro}
                        onValueChange={(v) => setForm({ ...form, MaVaiTro: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(vaiTro).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Phòng ban</Label>
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
                    <div className="space-y-2" />
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
                    {editingItem ? "Cập nhật" : "Lưu người dùng"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên đăng nhập, họ tên, email..."
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
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((u, idx) => {
                  const tt = trangThaiMap[u.TrangThai] ?? {
                    label: String(u.TrangThai),
                    variant: "outline" as const,
                  };
                  return (
                    <TableRow key={u.MaNguoiDung}>
                      <TableCell>
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {u.TenDangNhap}
                      </TableCell>
                      <TableCell className="font-medium">{u.HoTen}</TableCell>
                      <TableCell>{u.Email ?? "—"}</TableCell>
                      <TableCell>{vaiTro[u.MaVaiTro] ?? u.MaVaiTro}</TableCell>
                      <TableCell>
                        {u.MaPhongBan ? phongBan[u.MaPhongBan] : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tt.variant}>{tt.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(u)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteItem(u)}
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
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không tìm thấy người dùng nào
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
                {filtered.length} người dùng
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
                <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa người dùng{" "}
                  <strong>{deleteItem?.HoTen}</strong> (
                  {deleteItem?.TenDangNhap})? Hành động này không thể hoàn tác.
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

export default Users;
