"use client";

import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Building2,
  Calendar,
  Edit,
  History,
  Plus,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type MaintenanceUsage = {
  masudung: number;
  mataisan: number;
  macode: string;
  tentaisan: string;
  manguoisudung: number;
  hoten: string;
  phongban: string;
  ngaybatdau: string;
  ngayketthuc?: string;
  trangthai: string;
  ghichu?: string;
};

const trangThaiVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "Đang sử dụng": "default",
  "Đang bảo trì": "secondary",
  Hỏng: "destructive",
  "Hoàn thành": "default",
};

export default function MaintenanceUsage() {
  const [data, setData] = useState<MaintenanceUsage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceUsage | null>(null);
  const [deleteItem, setDeleteItem] = useState<MaintenanceUsage | null>(null);

  const [form, setForm] = useState({
    mataisan: "",
    manguoisudung: "",
    ngaytao: "",
    ngayketthuc: "",
    trangthai: "Đang sử dụng",
    ghichu: "",
  });

  // Fetch dữ liệu (kết hợp số lần bảo trì)
  const fetchSuDung = async () => {
    setLoading(true);

    // 1. Lấy danh sách sử dụng bảo trì
    const { data: suDungData, error } = await supabase
      .from("sudungbaotri")
      .select(
        `
      masudung,
      mataisan,
      manguoisudung,
      ngaytao,
      ngaycapnhat,
      trangthai,
      ghichu,
      taisan (macode, tentaisan),
      nguoidung (
        hoten,
        phongban (tenphongban)
      )
    `,
      )
      .order("masudung", { ascending: false });

    if (error) {
      console.error("Lỗi fetch sudungbaotri:", error);
      setData([]);
      setLoading(false);
      return;
    }

    const mapped = suDungData.map((item: any) => ({
      masudung: item.masudung,
      mataisan: item.mataisan,
      macode: item.taisan?.macode || "N/A",
      tentaisan: item.taisan?.tentaisan || "Không tìm thấy",
      manguoisudung: item.manguoisudung,
      hoten: item.nguoidung?.hoten || "Không rõ",
      phongban: item.nguoidung?.phongban?.tenphongban || "Không rõ",
      ngaybatdau: item.ngaytao,
      ngayketthuc: item.ngaycapnhat,
      trangthai: item.trangthai,
      ghichu: item.ghichu,
    }));

    setData(mapped);
    setLoading(false);
  };

  const filtered = data.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.tentaisan.toLowerCase().includes(q) ||
      item.macode.toLowerCase().includes(q) ||
      item.hoten.toLowerCase().includes(q) ||
      item.trangthai.toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setForm({
      mataisan: "",
      manguoisudung: "",
      ngaytao: new Date().toISOString().slice(0, 10),
      ngayketthuc: "",
      trangthai: "Đang sử dụng",
      ghichu: "",
    });
  };

  const handleEdit = (item: MaintenanceUsage) => {
    setEditingItem(item);
    setForm({
      mataisan: item.mataisan.toString(),
      manguoisudung: item.manguoisudung.toString(),
      ngaytao: item.ngaybatdau,
      ngayketthuc: item.ngayketthuc,
      trangthai: item.trangthai,
      ghichu: item.ghichu || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Dữ liệu cần gửi lên
      const payload = {
        mataisan: parseInt(form.mataisan),
        manguoisudung: parseInt(form.manguoisudung),
        trangthai: form.trangthai,
        ghichu: form.ghichu,
        // Lưu ý: Tên cột phải chuẩn xác như trong hình ảnh DB của bạn
        ngaybatdau: form.ngaytao,
      };

      if (editingItem) {
        // Lệnh Cập Nhật
        const { error } = await supabase
          .from("sudungbaotri")
          .update(payload)
          .eq("masudung", editingItem.masudung); // Dùng ID để tìm dòng cần sửa

        if (error) throw error;
      } else {
        // Lệnh Tạo Mới
        const { error } = await supabase.from("sudungbaotri").insert([payload]);

        if (error) throw error;
      }

      await fetchSuDung(); // Load lại bảng sau khi lưu
      setDialogOpen(false);
      resetForm();
      setEditingItem(null);
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      alert("Không thể cập nhật dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // Add implementation for delete
    setDeleteItem(null);
  };

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-emerald-600">
            <Wrench className="w-8 h-8" />
            Sử dụng & Bảo trì tài sản
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý người đang sử dụng và lịch sử bảo trì tài sản
          </p>
        </div>

        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" /> Ghi nhận sử dụng mới
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên tài sản, người sử dụng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Mã Sử dụng</TableHead>
              <TableHead>Tên tài sản</TableHead>
              <TableHead>Người sử dụng</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Ngày cập nhật</TableHead>
              <TableHead>Ghi chú</TableHead> {/* ← Cột mới */}
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center w-28">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.masudung}>

                <TableCell className="font-mono">{item.masudung}</TableCell>
                <TableCell>{item.tentaisan}</TableCell>
                <TableCell>{item.hoten}</TableCell>
                <TableCell>{item.phongban}</TableCell>
                <TableCell>{item.ngaybatdau}</TableCell>
                <TableCell>{item.ngayketthuc}</TableCell>
                <TableCell>{item.ghichu}</TableCell>
                <TableCell>
                  <Badge
                    variant={trangThaiVariant[item.trangthai] || "outline"}
                  >
                    {item.trangthai}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteItem(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                >
                  Chưa có dữ liệu sử dụng bảo trì
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog và AlertDialog giữ nguyên như trước */}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? "Cập nhật sử dụng bảo trì"
                : "Ghi nhận sử dụng bảo trì mới"}
            </DialogTitle>
          </DialogHeader>
          {/* Form nội dung */}
          <div className="grid gap-4 py-2">
            {/* Mã tài sản */}
            <div className="space-y-2">
              <Label htmlFor="masudung">Mã sử dụng</Label>
              <Input
                id="masudung"
                type="text"
                value={editingItem?.masudung || ""}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    masudung: Number(e.target.value),
                  } as MaintenanceUsage)
                }
                disabled
              />
            </div>
            {/* Các trường khác như trước */}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setEditingItem(null);
                setDialogOpen(false);
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
