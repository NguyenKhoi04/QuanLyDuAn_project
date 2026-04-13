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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Building2, MapPin, Plus, Edit, Trash2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ViTriTaiSan {
  mavtts: number;
  mataisan: number;
  macode: string;
  tentaisan: string;
  vitrihientai: number;
  tenvitri: string;
  trangthai: number;
  ghichu?: string;
  ngaycapnhat: string;
}

function AssetLocationTracking() {
  const [data, setData] = useState<ViTriTaiSan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ViTriTaiSan | null>(null);
  const [deleteItem, setDeleteItem] = useState<ViTriTaiSan | null>(null);

  const [form, setForm] = useState({
    mataisan: "",
    vitrihientai: "",
    trangthai: "1",
    ghichu: "",
  });

  // Fetch dữ liệu
  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vitritaisan")
      .select(`
        mavtts,
        mataisan,
        vitrihientai,
        trangthai,
        ghichu,
        ngaycapnhat,
        taisan (macode, tentaisan),
        vitri (tenvitri)
      `)
      .order("ngaycapnhat", { ascending: false });

    if (error) console.error(error);
    else {
      const mapped = data?.map((item: any) => ({
        mavtts: item.mavtts,
        mataisan: item.mataisan,
        macode: item.taisan?.macode || "N/A",
        tentaisan: item.taisan?.tentaisan || "Không tìm thấy",
        vitrihientai: item.vitrihientai,
        tenvitri: item.vitri?.tenvitri || "Không xác định",
        trangthai: item.trangthai,
        ghichu: item.ghichu,
        ngaycapnhat: item.ngaycapnhat,
      })) || [];
      setData(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      (a) =>
        a.tentaisan.toLowerCase().includes(q) ||
        a.macode.toLowerCase().includes(q) ||
        a.tenvitri.toLowerCase().includes(q)
    );
  }, [data, searchTerm]);

  const resetForm = () => {
    setForm({ mataisan: "", vitrihientai: "", trangthai: "1", ghichu: "" });
  };

  const handleSubmit = async () => {
    if (!form.mataisan || !form.vitrihientai) {
      alert("Vui lòng chọn mã tài sản và vị trí!");
      return;
    }

    const payload = {
      mataisan: Number(form.mataisan),
      vitrihientai: Number(form.vitrihientai),
      trangthai: Number(form.trangthai),
      ghichu: form.ghichu.trim(),
    };

    if (editingItem) {
      await supabase.from("vitritaisan").update(payload).eq("mavtts", editingItem.mavtts);
    } else {
      await supabase.from("vitritaisan").insert([payload]);
    }

    resetForm();
    setDialogOpen(false);
    setEditingItem(null);
    fetchLocations();
  };

  const handleEdit = (item: ViTriTaiSan) => {
    setEditingItem(item);
    setForm({
      mataisan: String(item.mataisan),
      vitrihientai: String(item.vitrihientai),
      trangthai: String(item.trangthai),
      ghichu: item.ghichu || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await supabase.from("vitritaisan").delete().eq("mavtts", deleteItem.mavtts);
    setDeleteItem(null);
    fetchLocations();
  };

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-500" />
            Theo dõi vị trí tài sản
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý vị trí hiện tại của tài sản theo tòa nhà và phòng ban
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { resetForm(); setEditingItem(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="h-4 w-4" /> Cập nhật vị trí mới
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Cập nhật vị trí" : "Ghi nhận vị trí tài sản"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
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
                <Label>Vị trí hiện tại *</Label>
                <Select value={form.vitrihientai} onValueChange={(v) => setForm({ ...form, vitrihientai: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Bạn có thể fetch danh sách vị trí từ bảng ViTri nếu cần */}
                    <SelectItem value="1">Tầng 1 - Phòng 101</SelectItem>
                    <SelectItem value="2">Tầng 2 - Phòng 201</SelectItem>
                    <SelectItem value="3">Tầng 3 - Phòng 301</SelectItem>
                    {/* Thêm các vị trí khác... */}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={form.trangthai} onValueChange={(v) => setForm({ ...form, trangthai: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Hoạt động</SelectItem>
                    <SelectItem value="0">Ngưng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Input
                  value={form.ghichu}
                  onChange={(e) => setForm({ ...form, ghichu: e.target.value })}
                  placeholder="Ghi chú thêm (nếu có)"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Hủy</Button>
              <Button onClick={handleSubmit}>
                {editingItem ? "Cập nhật" : "Lưu vị trí"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên tài sản hoặc vị trí..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Mã TS</TableHead>
              <TableHead>Tên tài sản</TableHead>
              <TableHead>Vị trí hiện tại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center w-24">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((asset) => (
              <TableRow key={asset.mavtts}>
                <TableCell className="font-mono">#{asset.mataisan}</TableCell>
                <TableCell className="font-medium">{asset.tentaisan}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <span>{asset.tenvitri}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={asset.trangthai === 1 ? "default" : "secondary"}>
                    {asset.trangthai === 1 ? "Hoạt động" : "Ngưng hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteItem(asset)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Không tìm thấy vị trí tài sản nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa vị trí của tài sản <strong>#{deleteItem?.mataisan}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDelete}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

export default AssetLocationTracking;