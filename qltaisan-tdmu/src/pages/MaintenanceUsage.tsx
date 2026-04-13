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
import { Building2, Calendar, Edit, History, Plus, Search, Trash2, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";


type MaintenanceUsage  = {
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
  solanbaotri: number;           // ← Số lần bảo trì
  lanbaotriganhat?: string;      // ← Lần bảo trì gần nhất
};

const trangThaiVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Đang sử dụng": "default",
  "Đang bảo trì": "secondary",
  "Hỏng": "destructive",
  "Hoàn thành": "default",
};

export default function MaintenanceUsage () {
  const [data, setData] = useState<MaintenanceUsage []>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceUsage  | null>(null);
  const [deleteItem, setDeleteItem] = useState<MaintenanceUsage  | null>(null);

  const [form, setForm] = useState({
    mataisan: "",
    manguoisudung: "",
    ngaybatdau: "",
    trangthai: "Đang sử dụng",
    ghichu: "",
  });

  // Fetch dữ liệu (kết hợp số lần bảo trì)
  const fetchSuDung = async () => {
  setLoading(true);

  // 1. Lấy danh sách sử dụng bảo trì
  const { data: suDungData, error } = await supabase
    .from("sudungbaotri")
    .select(`
      masudung,
      mataisan,
      ngaybatdau,
      ngayketthuc,
      trangthai,
      ghichu,
      taisan (macode, tentaisan),
      nguoidung (
        hoten,
        phongban (tenphongban)
      )
    `)
    .order("ngaybatdau", { ascending: false });

  if (error) {
    console.error("Lỗi fetch sudungbaotri:", error);
    setData([]);
    setLoading(false);
    return;
  }

  // 2. Lấy số lần bảo trì cho từng mataisan
  const mataisanList = suDungData.map(item => item.mataisan).filter(Boolean);

  let countMap = new Map<number, number>();

  if (mataisanList.length > 0) {
    const { data: lichsuData } = await supabase
      .from("lichsubaotri")
      .select("mataisan")
      .in("mataisan", mataisanList);

    // Đếm thủ công
    countMap = lichsuData?.reduce((acc, item) => {
      acc.set(item.mataisan, (acc.get(item.mataisan) || 0) + 1);
      return acc;
    }, new Map<number, number>()) || new Map();
  }

  // 3. Kết hợp dữ liệu
  const mapped = suDungData.map((item: any) => ({
    masudung: item.masudung,
    mataisan: item.mataisan,
    macode: item.taisan?.macode || "N/A",
    tentaisan: item.taisan?.tentaisan || "Không tìm thấy",
    manguoisudung: item.manguoisudung,
    hoten: item.nguoidung?.hoten || "Không rõ",
    phongban: item.nguoidung?.phongban?.tenphongban || "Không rõ",
    ngaybatdau: item.ngaybatdau,
    ngayketthuc: item.ngayketthuc,
    trangthai: item.trangthai,
    ghichu: item.ghichu,
    solanbaotri: countMap.get(item.mataisan) || 0,
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
      ngaybatdau: new Date().toISOString().slice(0, 10),
      trangthai: "Đang sử dụng",
      ghichu: "",
    });
  };

  const handleEdit = (item: MaintenanceUsage) => {
    setEditingItem(item);
    setForm({
      mataisan: item.mataisan.toString(),
      manguoisudung: item.manguoisudung.toString(),
      ngaybatdau: item.ngaybatdau,
      trangthai: item.trangthai,
      ghichu: item.ghichu || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Add implementation for create/update
    resetForm();
    setEditingItem(null);
    setDialogOpen(false);
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

        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => setDialogOpen(true)}>
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
              <TableHead className="w-24">Mã TS</TableHead>
              <TableHead>Tên tài sản</TableHead>
              <TableHead>Người sử dụng</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Lịch sử bảo trì</TableHead>     {/* ← Cột mới */}
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center w-28">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.masudung}>
                <TableCell className="font-mono">#{item.mataisan}</TableCell>
                <TableCell className="font-medium">{item.tentaisan}</TableCell>
                <TableCell>{item.hoten}</TableCell>
                <TableCell>{item.phongban}</TableCell>
                <TableCell>{item.ngaybatdau}</TableCell>

                {/* Cột Lịch sử bảo trì mới */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {item.solanbaotri} lần
                    </Badge>
                    {item.solanbaotri > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => alert(`Xem lịch sử bảo trì của tài sản #${item.mataisan}`)}
                      >
                        <History className="h-3.5 w-3.5 mr-1" />
                        Xem
                      </Button>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={trangThaiVariant[item.trangthai] || "outline"}>
                    {item.trangthai}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteItem(item)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  Chưa có dữ liệu sử dụng bảo trì
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog và AlertDialog giữ nguyên như trước */}
      {/* ... */}
    </AppShell>
  );
}