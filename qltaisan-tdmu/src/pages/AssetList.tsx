import AppShell from "@/components/AppShell";
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
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// const loaiTaiSan: Record<number, string> = {
//   1: "Máy tính",
//   2: "Bàn ghế",
//   3: "Máy chiếu",
//   4: "Thiết bị mạng",
//   5: "Điều hòa",
// };

// const phongBan: Record<number, string> = {
//   1: "Viện Đào tạo CNTT & Chuyển đổi số",
//   2: "Phòng Kế toán",
//   3: "Phòng Nhân sự",
//   4: "Thực hành Máy tính - Dãy C",
//   5: "Khoa Kinh tế",
// };

// const viTri: Record<number, string> = {
//   1: "Tầng 3 - P301",
//   2: "Tầng 1 - P101",
//   3: "Tầng 2 - P201",
//   4: "Tầng 2 - P202",
//   5: "Tầng 3 - P301",
// };

// const nhaCungCap: Record<number, string> = {
//   1: "Công ty ABC",
//   2: "Công ty XYZ",
//   3: "Công ty DEF",
//   4: "Công ty GHI",
// };

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
  maTaiSan: number;
  maTS: string;
  tentaisan: string;
  maloai: number;
  maphongban: number;
  mavitri: number;
  manhacungcap: number | null;
  ngaymua: string | null;
  trangthai: number;
}

// const initialData: TaiSan[] = [
//   {
//     MaTaiSan: 1,
//     MaTS: "TS001",
//     TenTaiSan: "Máy tính Dell Vostro 3510",
//     MaLoai: 1,
//     MaPhongBan: 1,
//     MaViTri: 1,
//     MaNhaCungCap: 1,
//     NgayMua: "2023-03-15",
//     TrangThai: 1,
//   },
//   {
//     MaTaiSan: 2,
//     MaTS: "TS002",
//     TenTaiSan: "Máy tính HP ProBook 450",
//     MaLoai: 1,
//     MaPhongBan: 4,
//     MaViTri: 3,
//     MaNhaCungCap: 2,
//     NgayMua: "2023-05-20",
//     TrangThai: 1,
//   },
//   {
//     MaTaiSan: 3,
//     MaTS: "TS003",
//     TenTaiSan: "Bàn làm việc 1m2",
//     MaLoai: 2,
//     MaPhongBan: 2,
//     MaViTri: 2,
//     MaNhaCungCap: 3,
//     NgayMua: "2022-11-10",
//     TrangThai: 1,
//   },
//   {
//     MaTaiSan: 4,
//     MaTS: "TS004",
//     TenTaiSan: "Ghế xoay văn phòng",
//     MaLoai: 2,
//     MaPhongBan: 3,
//     MaViTri: 4,
//     MaNhaCungCap: 3,
//     NgayMua: "2022-11-10",
//     TrangThai: 2,
//   },
//   {
//     MaTaiSan: 5,
//     MaTS: "TS005",
//     TenTaiSan: "Máy chiếu Epson EB-X51",
//     MaLoai: 3,
//     MaPhongBan: 4,
//     MaViTri: 3,
//     MaNhaCungCap: 1,
//     NgayMua: "2024-01-08",
//     TrangThai: 1,
//   },
//   {
//     MaTaiSan: 6,
//     MaTS: "TS006",
//     TenTaiSan: "Switch Cisco 24 port",
//     MaLoai: 4,
//     MaPhongBan: 1,
//     MaViTri: 1,
//     MaNhaCungCap: 2,
//     NgayMua: "2023-07-22",
//     TrangThai: 3,
//   },
//   {
//     MaTaiSan: 7,
//     MaTS: "TS007",
//     TenTaiSan: "Điều hòa Daikin 12000BTU",
//     MaLoai: 5,
//     MaPhongBan: 5,
//     MaViTri: 5,
//     MaNhaCungCap: 4,
//     NgayMua: "2021-06-15",
//     TrangThai: 4,
//   },
//   {
//     MaTaiSan: 8,
//     MaTS: "TS008",
//     TenTaiSan: "Máy tính Lenovo ThinkPad",
//     MaLoai: 1,
//     MaPhongBan: 2,
//     MaViTri: 2,
//     MaNhaCungCap: 1,
//     NgayMua: "2024-02-28",
//     TrangThai: 2,
//   },
//   {
//     MaTaiSan: 9,
//     MaTS: "TS009",
//     TenTaiSan: "Router WiFi TP-Link",
//     MaLoai: 4,
//     MaPhongBan: 1,
//     MaViTri: 1,
//     MaNhaCungCap: 2,
//     NgayMua: "2023-09-05",
//     TrangThai: 1,
//   },
//   {
//     MaTaiSan: 10,
//     MaTS: "TS010",
//     TenTaiSan: "Máy chiếu BenQ MH560",
//     MaLoai: 3,
//     MaPhongBan: 5,
//     MaViTri: 5,
//     MaNhaCungCap: 4,
//     NgayMua: null,
//     TrangThai: 2,
//   },
// ];

// Removed duplicate AssetList definition and related state/hooks above.
// The correct AssetList function is defined below.
// };

const ITEMS_PER_PAGE = 5;

function AssetList() {
  const [data, setData] = useState<TaiSan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaiSan | null>(null);
  const [deleteItem, setDeleteItem] = useState<TaiSan | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Danh mục
  const [loaiTaiSanList, setLoaiTaiSanList] = useState<any[]>([]);
  const [phongBanList, setPhongBanList] = useState<any[]>([]);
  const [viTriList, setViTriList] = useState<any[]>([]);
  const [nhaCungCapList, setNhaCungCapList] = useState<any[]>([]);

  const emptyForm = {
    maTS: "",
    tentaisan: "",
    maloai: "",
    maphongban: "",
    mavitri: "",
    manhacungcap: "",
    ngaymua: "",
    trangthai: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // ====================== FETCH DATA ======================
  const fetchAssets = async () => {
    setLoading(true);
    const { data: taiSanData, error } = await supabase
      .from("taisan")
      .select("*")
      .order("maTaiSan", { ascending: true });

    if (error) {
      console.error("Lỗi lấy tài sản:", error);
      setData([]);
    } else {
      const normalized = (taiSanData || []).map((item: any) => ({
        maTaiSan: item.maTaiSan ?? item.MaTaiSan,
        maTS: item.maTS ?? item.MaTS ?? "",
        tentaisan: item.tentaisan ?? item.TenTaiSan ?? "",
        maloai: item.maloai ?? item.MaLoai,
        maphongban: item.maphongban ?? item.MaPhongBan,
        mavitri: item.mavitri ?? item.MaViTri,
        manhacungcap: item.manhacungcap ?? item.MaNhaCungCap ?? null,
        ngaymua: item.ngaymua ?? item.NgayMua ?? null,
        trangthai: item.trangthai ?? item.TrangThai ?? 0,
      }));
      setData(normalized);
    }
    setLoading(false);
  };

  const fetchDanhMuc = async () => {
    const [loai, phong, vitri, ncc] = await Promise.all([
      supabase.from("loaitaisan").select("maloai, tenloai"),
      supabase.from("phongban").select("maphongban, tenphongban"),
      supabase.from("vitri").select("mavitri, tenvitri"),
      supabase.from("nhacungcap").select("manhacungcap, tennhacungcap"),
    ]);

    setLoaiTaiSanList(loai.data || []);
    setPhongBanList(phong.data || []);
    setViTriList(vitri.data || []);
    setNhaCungCapList(ncc.data || []);
  };

  useEffect(() => {
    fetchDanhMuc();
    fetchAssets();
  }, []);

  // ====================== FILTER & PAGINATION ======================
  const filtered = data.filter(
    (ts) =>
      ts.tentaisan?.toLowerCase().includes(search.toLowerCase()) ||
      ts.maTS?.toLowerCase().includes(search.toLowerCase()),
  );

  // const filtered = data.filter(
  //   (ts) =>
  //     ts.TenTaiSan.toLowerCase().includes(search.toLowerCase()) ||
  //     ts.MaTS.toLowerCase().includes(search.toLowerCase()),
  // );

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
  // ====================== CRUD ======================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (
      !form.maTS.trim() ||
      !form.tentaisan.trim() ||
      !form.maloai ||
      !form.maphongban ||
      !form.mavitri ||
      !form.trangthai
    ) {
      setFormError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    // const item: TaiSan = {
    //   MaTaiSan: editingItem
    //     ? editingItem.MaTaiSan
    //     : Math.max(...data.map((d) => d.MaTaiSan), 0) + 1,
    //   MaTS: form.MaTS.trim(),
    //   TenTaiSan: form.TenTaiSan.trim(),
    //   MaLoai: Number(form.MaLoai),
    //   MaPhongBan: Number(form.MaPhongBan),
    //   MaViTri: Number(form.MaViTri),
    //   MaNhaCungCap: form.MaNhaCungCap ? Number(form.MaNhaCungCap) : null,
    //   NgayMua: form.NgayMua || null,
    //   TrangThai: Number(form.TrangThai),
    // };

    const newAsset = {
      maTS: form.maTS.trim(),
      tentaisan: form.tentaisan.trim(),
      maloai: Number(form.maloai),
      maphongban: Number(form.maphongban),
      mavitri: Number(form.mavitri),
      manhacungcap: form.manhacungcap ? Number(form.manhacungcap) : null,
      ngaymua: form.ngaymua || null,
      trangthai: Number(form.trangthai),
    };

    if (editingItem) {
      const { error } = await supabase
        .from("taisan")
        .update(newAsset)
        .eq("maTaiSan", editingItem.maTaiSan);
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from("taisan").insert([newAsset]);
      if (error) console.error(error);
    }

    resetForm();
    setDialogOpen(false);
    setEditingItem(null);
    fetchAssets();
  };
  const handleEdit = (ts: TaiSan) => {
    setEditingItem(ts);
    fetchAssets(); // Refresh data before editing

    setForm({
      maTS: ts.maTS,
      tentaisan: ts.tentaisan,
      maloai: String(ts.maloai),
      maphongban: String(ts.maphongban),
      mavitri: String(ts.mavitri),
      manhacungcap: String(ts.manhacungcap),
      ngaymua: ts.ngaymua,
      trangthai: String(ts.trangthai),
    });
    setFormError("");
    setDialogOpen(true);
  };
  // const handleDelete = () => {
  //   if (deleteItem) {
  //     setData(data.filter((d) => d.MaTaiSan !== deleteItem.MaTaiSan));
  //     setDeleteItem(null);
  //   }
  // };
  const handleDelete = async () => {
    if (!deleteItem) return;

    const { error } = await supabase
      .from("taisan")
      .delete()
      .eq("maTaiSan", deleteItem.maTaiSan);

    if (error) console.error("Lỗi xóa:", error);

    setDeleteItem(null);
    fetchAssets();
  };

  // Reset page when search changes
  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  return (
    <AppShell>
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
            {/* <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Chỉnh sửa tài sản" : "Thêm tài sản mới"}
                  </DialogTitle>
                </DialogHeader> */}

            {/* Form giữ nguyên như cũ, chỉ thay tên field */}
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
                    value={form.maTS}
                    onChange={(e) => setForm({ ...form, maTS: e.target.value })}
                    placeholder="VD: TS011"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tên tài sản *</Label>
                  <Input
                    value={form.tentaisan}
                    onChange={(e) =>
                      setForm({ ...form, tentaisan: e.target.value })
                    }
                    placeholder="Nhập tên tài sản"
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại tài sản *</Label>
                  {/* <Select
                        value={form.maloai}
                        onValueChange={(v) => setForm({ ...form, maloai: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(loaitaisan).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select> */}

                  <Select
                    value={form.maloai}
                    onValueChange={(v) => setForm({ ...form, maloai: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại tài sản" />
                    </SelectTrigger>
                    <SelectContent>
                      {loaiTaiSanList.map((item) => (
                        <SelectItem
                          key={item.maloai}
                          value={String(item.maloai)}
                        >
                          {item.tenloai}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phòng ban *</Label>
                  <Select
                    value={form.maphongban}
                    onValueChange={(v) => setForm({ ...form, maphongban: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    {/* <SelectContent>
                          {Object.entries(phongban).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent> */}

                    <SelectContent>
                      {phongBanList.map((pb) => (
                        <SelectItem
                          key={pb.maphongban}
                          value={String(pb.maphongban)}
                        >
                          {pb.tenphongban}
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
                    value={form.mavitri}
                    onValueChange={(v) => setForm({ ...form, mavitri: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vị trí" />
                    </SelectTrigger>
                    {/* <SelectContent>
                          {Object.entries(vitri).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent> */}

                    <SelectContent>
                      {viTriList.map((vt) => (
                        <SelectItem key={vt.mavitri} value={String(vt.mavitri)}>
                          {vt.tenvitri}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nhà cung cấp</Label>
                  <Select
                    value={form.manhacungcap}
                    onValueChange={(v) => setForm({ ...form, manhacungcap: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn NCC" />
                    </SelectTrigger>
                    {/* <SelectContent>
                          {Object.entries(nhacungcap).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent> */}

                    <SelectContent>
                      {nhaCungCapList.map((ncc) => (
                        <SelectItem
                          key={ncc.manhacungcap}
                          value={String(ncc.manhacungcap)}
                        >
                          {ncc.tennhacungcap}
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
                    value={form.ngaymua || ""}
                    onChange={(e) =>
                      setForm({ ...form, ngaymua: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trạng thái *</Label>
                  <Select
                    value={form.trangthai}
                    onValueChange={(v) => setForm({ ...form, trangthai: v })}
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
              const tt = trangThaiMap[ts.trangthai];
              return (
                <TableRow key={ts.maTaiSan}>
                  <TableCell>
                    {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {ts.maTaiSan}
                  </TableCell>
                  <TableCell className="font-medium">{ts.tentaisan}</TableCell>
                  {/* <TableCell>{loaitaisan[ts.maloai]}</TableCell>
                      <TableCell>{phongban[ts.maphongban]}</TableCell>
                      <TableCell>{vitri[ts.mavitri]}</TableCell>
                      <TableCell>
                        {ts.manhacungcap ? nhacungcap[ts.manhacungcap] : "—"}
                      </TableCell> */}

                  <TableCell>
                    {loaiTaiSanList.find((l) => l.maloai === ts.maloai)
                      ?.tenloai || "—"}
                  </TableCell>
                  <TableCell>
                    {phongBanList.find((p) => p.maphongban === ts.maphongban)
                      ?.tenphongban || "—"}
                  </TableCell>
                  <TableCell>
                    {viTriList.find((v) => v.mavitri === ts.mavitri)
                      ?.tenvitri || "—"}
                  </TableCell>
                  <TableCell>
                    {ts.manhacungcap
                      ? nhaCungCapList.find(
                          (n) => n.manhacungcap === ts.manhacungcap,
                        )?.tennhacungcap
                      : "—"}
                  </TableCell>

                  <TableCell>{ts.ngaymua ?? "—"}</TableCell>
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
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
              <strong>{deleteItem?.tentaisan}</strong> ({deleteItem?.maTaiSan}
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
    </AppShell>
  );
}

export default AssetList;
