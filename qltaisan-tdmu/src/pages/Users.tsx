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
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
//import axios from "axios";

// const vaiTro: Record<number, string> = {
//   1: "Quản trị",
//   2: "Quản lý",
//   3: "Nhân viên",
// };

// const phongBan: Record<number, string> = {
//   1: "Phòng CNTT",
//   2: "Phòng Kế toán",
//   3: "Phòng Nhân sự",
//   4: "Khoa CNTT",
//   5: "Khoa Kinh tế",
// };

// const trangThaiMap: Record<
//   number,
//   { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
// > = {
//   1: { label: "Đang hoạt động", variant: "default" },
//   0: { label: "Ngưng hoạt động", variant: "secondary" },
// };

interface NguoiDung {
  manguoidung: number;
  tendangnhap: string;
  hoten: string;
  email?: string | null;
  mavaitro: number;
  tenvaitro: string;        // join từ vaitro
  maphongban?: number | null;
  tenphongban?: string;     // join từ phongban
  trangthai: number;
}

// const initialData: NguoiDung[] = [
//   {
//     MaNguoiDung: 1,
//     TenDangNhap: "admin",
//     MatKhau: "admin123",
//     HoTen: "Quản trị hệ thống",
//     Email: "admin@tdmu.edu.vn",
//     MaVaiTro: 1,
//     MaPhongBan: 1,
//     TrangThai: 1,
//   },
//   {
//     MaNguoiDung: 2,
//     TenDangNhap: "manager01",
//     MatKhau: "manager123",
//     HoTen: "Phan Nguyễn Ngọc Khôi",
//     Email: "2224801030082@student.tdmu.edu.vn",
//     MaVaiTro: 2,
//     MaPhongBan: 2,
//     TrangThai: 1,
//   },
//   {
//     MaNguoiDung: 3,
//     TenDangNhap: "staff01",
//     MatKhau: "staff123",
//     HoTen: "Phạm Huỳnh Ngọc Sơn",
//     Email: "2324802010339@student.tdmu.edu.vn",
//     MaVaiTro: 3,
//     MaPhongBan: 3,
//     TrangThai: 0,
//   },
// ];

const ITEMS_PER_PAGE = 5;

function Users() {
  const [data, setData] = useState<NguoiDung[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NguoiDung | null>(null);
  const [deleteItem, setDeleteItem] = useState<NguoiDung | null>(null);
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [vaiTroList, setVaiTroList] = useState<any[]>([]);
  const [phongBanList, setPhongBanList] = useState<any[]>([]);
  const [trangthaiList, setTrangthaiList] = useState<any[]>([]);

  const emptyForm = {
    tendangnhap: "",
    matkhau: "",
    hoten: "",
    email: "",
    mavaitro: "",
    maphongban: "",
    trangthai: "1",
  };

  const [form, setForm] = useState(emptyForm);

  // ====================== FETCH DATA ======================
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("nguoidung")
      .select(`
        manguoidung,
        tendangnhap,
        hoten,
        email,
        mavaitro,
        maphongban,
        trangthai,
        vaitro (tenvaitro),
        phongban (tenphongban)
      `)
      .order("manguoidung", { ascending: true });

    if (error) {
      console.error("Lỗi lấy người dùng:", error);
    } else {
      const mapped = data?.map((item: any) => ({
        manguoidung: item.manguoidung,
        tendangnhap: item.tendangnhap,
        hoten: item.hoten,
        email: item.email,
        mavaitro: item.mavaitro,
        tenvaitro: item.vaitro?.tenvaitro || "Không xác định",
        maphongban: item.maphongban,
        tenphongban: item.phongban?.tenphongban || null,
        trangthai: item.trangthai,
      })) || [];
      setData(mapped);
    }
    setLoading(false);
  };

  const fetchDanhMuc = async () => {
  const [vt, pb] = await Promise.all([
    supabase.from("vaitro").select("mavaitro, tenvaitro"),
    supabase.from("phongban").select("maphongban, tenphongban"),
  ]);

  setVaiTroList(vt.data || []);
  setPhongBanList(pb.data || []);
};

  useEffect(() => {
    fetchDanhMuc();
    fetchUsers();
  }, []);

  // ====================== FILTER ======================
  const filtered = data.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.tendangnhap.toLowerCase().includes(q) ||
      u.hoten.toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      u.tenvaitro.toLowerCase().includes(q)
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
    if (!form.tendangnhap.trim() || !form.hoten.trim() || !form.mavaitro) {
      setFormError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    const payload = {
      tendangnhap: form.tendangnhap.trim(),
      matkhau: form.matkhau.trim() || "123456", // tạm thời nếu không nhập
      hoten: form.hoten.trim(),
      email: form.email.trim() || null,
      mavaitro: Number(form.mavaitro),
      maphongban: form.maphongban ? Number(form.maphongban) : null,
      trangthai: Number(form.trangthai),
    };

    let error: any;

    if (editingItem) {
      const res = await supabase
        .from("nguoidung")
        .update(payload)
        .eq("manguoidung", editingItem.manguoidung);

        
      error = res.error;
    } else {
      const res = await supabase
        .from("nguoidung")
        .insert([payload]);

      error = res.error;
    }

    if (error) {
      console.log(error);
      alert("Lỗi lưu dữ liệu");
      return;
    }

    alert("Lưu thành công");


    resetForm();
    setDialogOpen(false);
    setEditingItem(null);
    fetchUsers();
  };

  const handleEdit = (u: NguoiDung) => {
    setEditingItem(u);
    setForm({
      tendangnhap: u.tendangnhap,
      matkhau: "", // không hiển thị mật khẩu cũ
      hoten: u.hoten,
      email: u.email || "",
      mavaitro: String(u.mavaitro),
      maphongban: u.maphongban ? String(u.maphongban) : "",
      trangthai: String(u.trangthai),
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await supabase.from("nguoidung").delete().eq("manguoidung", deleteItem.manguoidung);
    setDeleteItem(null);
    fetchUsers();
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // useEffect(() => {
  //   axios
  //     .get("http://localhost:3000/users")
  //     .then((res) => setData(res.data))
  //     .catch(() => {
  //       // keep initialData when api is unavailable
  //     });
  // }, 
  // []);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Quản lý người dùng</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { resetForm(); setEditingItem(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Thêm người dùng
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên đăng nhập *</Label>
                  <Input value={form.tendangnhap} onChange={(e) => setForm({ ...form, tendangnhap: e.target.value })} placeholder="VD: admin" />
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu {editingItem ? "(để trống nếu không đổi)" : "*"}</Label>
                  <Input type="password" value={form.matkhau} onChange={(e) => setForm({ ...form, matkhau: e.target.value })} placeholder="Nhập mật khẩu" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Họ tên *</Label>
                  <Input value={form.hoten} onChange={(e) => setForm({ ...form, hoten: e.target.value })} placeholder="Nhập họ tên" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="VD: user@tdmu.edu.vn" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Vai trò *</Label>

                    <Select
                      value={form.mavaitro}
                      onValueChange={(v) =>
                        setForm({ ...form, mavaitro: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>

                      <SelectContent>
                        {vaiTroList.map((item) => (
                          <SelectItem
                            key={item.mavaitro}
                            value={String(item.mavaitro)}
                          >
                            {item.tenvaitro}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  <div className="space-y-2">
                    <Label>Phòng ban</Label>

                    <Select
                      value={form.maphongban}
                      onValueChange={(v) =>
                        setForm({ ...form, maphongban: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban" />
                      </SelectTrigger>

                      <SelectContent>
                        {phongBanList.map((item) => (
                          <SelectItem
                            key={item.maphongban}
                            value={String(item.maphongban)}
                          >
                            {item.tenphongban}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
              </div>

              <div className="space-y-2">
                  <Label>Trạng thái *</Label>

                  <Select
                    value={form.trangthai}
                    onValueChange={(v) =>
                      setForm({ ...form, trangthai: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        Đang hoạt động
                      </SelectItem>

                      <SelectItem value="0">
                        Ngưng hoạt động
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Hủy</Button>
              <Button onClick={handleSubmit}>
                {editingItem ? "Cập nhật" : "Lưu người dùng"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
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
        {loading ? (
          <p className="text-center py-12">Đang tải dữ liệu...</p>
        ) : (
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
              {paged.map((u, idx) => (
                <TableRow key={u.manguoidung}>
                  <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs">{u.tendangnhap}</TableCell>
                  <TableCell className="font-medium">{u.hoten}</TableCell>
                  <TableCell>{u.email ?? "—"}</TableCell>
                  <TableCell>{u.tenvaitro}</TableCell>
                  <TableCell>{u.tenphongban ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={u.trangthai === 1 ? "default" : "secondary"}>
                      {u.trangthai === 1 ? "Đang hoạt động" : "Ngưng hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteItem(u)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy người dùng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

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
                  <strong>{deleteItem?.hoten}</strong> (
                  {deleteItem?.tendangnhap})? Hành động này không thể hoàn tác.
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

export default Users;
