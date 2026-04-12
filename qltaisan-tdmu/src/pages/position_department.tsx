import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type PositionDepartment = {
  mavitri: number;
  toanha: string;
  tang: string;
  phong: string;
};



const ITEMS_PER_PAGE = 20;

function PositionDepartment() {
  const [data, setData] = useState<PositionDepartment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PositionDepartment | null>(
    null,
  );
  const [deleteItem, setDeleteItem] = useState<PositionDepartment | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Danh mục
  const [phongBanList, setPhongBanList] = useState<any[]>([]);
  const [toanhaList, setToanhaList] = useState<any[]>([]);
  const [tangList, setTangList] = useState<any[]>([]);
  const [phongList, setPhongList] = useState<any[]>([]);

  const emptyForm = {
    mavitri: 0,
    toanha: "",
    tang: "",
    phong: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const tableRef = useRef<HTMLTableElement>(null);

  const handleResize = (
    e: ReactMouseEvent<HTMLTableHeaderCellElement>,
    columnIndex: number,
  ) => {
    e.preventDefault();
    const th = e.currentTarget;
    const startX = e.pageX;
    const startWidth = th.offsetWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.pageX - startX);
      if (newWidth > 80) {
        th.style.width = `${newWidth}px`;
      }
    };

    const onMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // ====================== FETCH DATA ======================
  const fetchAssets = async () => {
    setLoading(true);
    const { data: taiSanData, error } = await supabase
      .from("vitri")
      .select("*")
      .order("mavitri", { ascending: true });

    if (error) {
      console.error("Lỗi lấy vitri:", error);
      console.error("Chi tiết lỗi:", error);
      setData([]);
    } else {
      const normalized = (taiSanData || []).map((item: any) => ({
        // macode: item.macode ?? item.macode,
        mavitri: item.mavitri ?? item.mavitri ?? 0,
        toanha: item.toanha ?? item.Toanha ?? "",
        tang: item.tang ?? item.Tang ?? "",
        phong: item.phong ?? item.phong ?? "",
      }));
      console.log("✅ Lấy thành công:", taiSanData?.length, "bản ghi");
      setData(normalized);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // ====================== FILTER & PAGINATION ======================
  const filtered = data.filter(
    (ts) =>
      ts.toanha?.toLowerCase().includes(search.toLowerCase()) ||
      ts.tang?.toLowerCase().includes(search.toLowerCase()) ||
      ts.phong?.toLowerCase().includes(search.toLowerCase()),
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
  // ====================== CRUD ======================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (
      !form.mavitri.toString().trim() ||
      !form.toanha.trim() ||
      !form.tang.trim() ||
      !form.phong.trim()
    ) {
      setFormError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    const newAsset = {
      mavitri: form.mavitri,
      toanha: form.toanha,
      tang: form.tang,
      phong: form.phong,
    };

    if (editingItem) {
      const { error } = await supabase
        .from("taisan")
        .update(newAsset)
        .eq("mavitri", editingItem.mavitri);
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
  const handleEdit = (vt: PositionDepartment) => {
    setEditingItem(vt);
    fetchAssets(); // Refresh data before editing

    setForm({
      mavitri: vt.mavitri || 0,
      toanha: vt.toanha || "",
      tang: vt.tang || "",
      phong: vt.phong || "",
    });
    setFormError("");
    setDialogOpen(true);
  };
  // const handleDelete = () => {
  //   if (deleteItem) {
  //     setData(data.filter((d) => d.macode !== deleteItem.macode));
  //     setDeleteItem(null);
  //   }
  // };
  const handleDelete = async () => {
    if (!deleteItem) return;

    const { error } = await supabase
      .from("vitri")
      .delete()
      .eq("mavitri", deleteItem.mavitri);

    if (error) console.error("Lỗi xóa:", error);

    setDeleteItem(null);
    fetchAssets();
  };

  // Reset page when search changes
  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [currentPage]);

  useEffect(() => {
    fetchAssets();
  }, [search]);



  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Danh sách vị trí phòng ban
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
              <Plus className="h-4 w-4" /> Thêm vị trí
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            {/* Form giữ nguyên như cũ, chỉ thay tên field */}
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Chỉnh sửa vị trí" : "Thêm vị trí mới"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã Vị trí *</Label>
                  <Input
                    value={form.mavitri}
                    onChange={(e) =>
                      setForm({ ...form, mavitri: Number(e.target.value) })
                    }
                    placeholder="VD: VT001"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tòa nhà </Label>
                  <Input
                    value={form.toanha}
                    onChange={(e) =>
                      setForm({ ...form, toanha: e.target.value })
                    }
                    placeholder="Nhập tên tòa nhà"
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Tầng */}
                <div className="space-y-2">
                  <Label>Tầng *</Label>
                  <Input
                    type="text"
                    placeholder="Ví dụ: 3"
                    value={form.tang}
                    onChange={(e) => setForm({ ...form, tang: e.target.value })}
                  />
                </div>

                {/* Phòng ban */}
                <div className="space-y-2">
                  <Label>Phòng ban *</Label>
                  <Input
                    type="text"
                    placeholder="Ví dụ: Viện Công nghệ số"
                    value={form.phong}
                    onChange={(e) =>
                      setForm({ ...form, phong: e.target.value })
                    }
                  />
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

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table ref={tableRef} className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead
                  onMouseDown={(e) => handleResize(e, 0)}
                  className="w-24 cursor-col-resize"
                >
                  Mã Vị trí
                </TableHead>
                <TableHead
                  onMouseDown={(e) => handleResize(e, 1)}
                  className="w-1/4 cursor-col-resize"
                >
                  Tòa nhà
                </TableHead>
                <TableHead
                  onMouseDown={(e) => handleResize(e, 2)}
                  className="w-1/4 cursor-col-resize"
                >
                  Tầng
                </TableHead>
                <TableHead
                  onMouseDown={(e) => handleResize(e, 3)}
                  className="w-1/4 cursor-col-resize"
                >
                  Phòng ban
                </TableHead>
                <TableHead
                  onMouseDown={(e) => handleResize(e, 4)}
                  className="w-1/4 cursor-col-resize"
                >
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((vt) => (
                <TableRow key={vt.mavitri}>
                  <TableCell>{vt.mavitri}</TableCell>
                  <TableCell>{vt.toanha}</TableCell>
                  <TableCell>{vt.tang}</TableCell>
                  <TableCell>{vt.phong}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(vt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteItem(vt)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Hiển thị{" "}
            {paged.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} /{" "}
            {filtered.length} vị trí
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
            <AlertDialogTitle>Xác nhận xóa vị trí</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vị trí{" "}
              <strong>{deleteItem?.mavitri}</strong> ({deleteItem?.toanha}
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

export default PositionDepartment;
