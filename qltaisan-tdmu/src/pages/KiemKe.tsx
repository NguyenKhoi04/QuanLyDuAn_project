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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/supabaseClient";
import { useEffect } from "react";

type KiemKeTaiSan = {
  makiemke: number;
  mataisan: number;
  tentaisan: string; // join từ TaiSan
  nguoikiemke: number;
  tennguoikiemke: string; // join từ NguoiDung
  ngaykiemke: string;
  trangthai: string;
  KetQua: string;
};

// const initialKiemKe: KiemKeTaiSan[] = [
//   {
//     makiemke: 1,
//     mataisan: 101,
//     tentaisan: "Máy tính Dell",
//     nguoikiemke: 1,
//     tennguoikiemke: "Nguyễn Văn A",
//     NgayKiemKe: "2026-04-01",
//     TrangThai: "Đã kiểm kê",
//     KetQua: "Bình thường",
//   },
// ];

function getTrangThaiVariant(
  trangThai: string,
): "default" | "secondary" | "destructive" | "outline" {
  const s = trangThai.toLowerCase();

  if (s.includes("bình thường")) return "default"; // 🟢 xanh
  if (s.includes("tốt")) return "default"; // 🟢 xanh
  if (s.includes("cảnh báo")) return "secondary"; // 🟡 vàng
  if (s.includes("hư nhẹ")) return "secondary"; // 🟡 vàng
  if (s.includes("hỏng")) return "destructive"; // 🔴 đỏ
  if (s.includes("hỏng nặng")) return "destructive"; // 🔴 đỏ đậm
  if (s.includes("mất")) return "destructive"; // 🔴 đỏ

  return "outline"; // mặc định
}

export default function KiemKe() {
  const [kiemKeList, setKiemKeList] = useState<KiemKeTaiSan[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const emptyForm = useMemo(
    () => ({
      MaTaiSan: "",
      TenTaiSan: "",
      NgayKiemKe: "",
      TrangThai: "Đã kiểm kê",
      KetQua: "",
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  function resetForm() {
    setForm(emptyForm);
    setFormError("");
  }

  async function handleCreate() {
    const maTaiSan = Number(form.MaTaiSan);
    const tenTaiSan = form.TenTaiSan.trim();
    const ngayKiemKe = form.NgayKiemKe;
    const trangThai = form.TrangThai;
    const KetQua = form.KetQua.trim();

    if (!maTaiSan || !tenTaiSan || !ngayKiemKe || !trangThai || !KetQua) {
      setFormError("Vui lòng điền đầy đủ thông tin kiểm kê.");
      return;
    }

    const nextId =
      kiemKeList.reduce((max, x) => Math.max(max, x.makiemke), 0) + 1;

    const newItem: KiemKeTaiSan = {
      makiemke: nextId,
      mataisan: maTaiSan,
      tentaisan: tenTaiSan,
      nguoikiemke: 0,
      tennguoikiemke: "",
      ngaykiemke: ngayKiemKe,
      trangthai: trangThai,
      KetQua: KetQua,
    };

    setKiemKeList((prev) => [newItem, ...prev]);
    setDialogOpen(false);
    resetForm();
  }

  useEffect(() => {
  async function fetchData() {
    const { data, error } = await supabase
      .from("kiemketaisan")
      .select(`
        makiemke,
        mataisan,
        taisan (tentaisan),
        nguoikiemke,
        nguoidung (hoten),
        ngaykiemke,
        trangthai,
        KetQua
      `);

    if (error) {
      console.error(error);
      return;
    }

    if (!data) return;

      const mapped = data.map((item: any) => ({
        makiemke: item.makiemke,
        mataisan: item.mataisan,
        tentaisan: item.taisan?.tentaisan || "",
        nguoikiemke: item.nguoikiemke,
        tennguoikiemke: item.nguoidung?.hoten || "",
        ngaykiemke: item.ngaykiemke,
        trangthai: item.trangthai,
        KetQua: item.KetQua || "",
      }));

    setKiemKeList(mapped);
  }

  fetchData();
}, []);

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-emerald-500">
            <ClipboardList className="h-6 w-6" />
            Kiểm kê định kỳ tài sản
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý kiểm kê và cập nhật tình trạng tài sản
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tạo đợt kiểm kê mới</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã tài sản *</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="VD: 101"
                    value={form.MaTaiSan}
                    onChange={(e) =>
                      setForm({ ...form, MaTaiSan: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngày kiểm kê *</Label>
                  <Input
                    type="date"
                    value={form.NgayKiemKe}
                    onChange={(e) =>
                      setForm({ ...form, NgayKiemKe: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tên tài sản *</Label>
                <Input
                  placeholder="VD: Máy tính Dell"
                  value={form.TenTaiSan}
                  onChange={(e) =>
                    setForm({ ...form, TenTaiSan: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trạng thái *</Label>
                  <Input
                    placeholder="VD: Đã kiểm kê"
                    value={form.TrangThai}
                    onChange={(e) =>
                      setForm({ ...form, TrangThai: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kết quả *</Label>
                  <Input
                    placeholder="VD: Bình thường"
                    value={form.KetQua}
                    onChange={(e) =>
                      setForm({ ...form, KetQua: e.target.value })
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
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleCreate}
              >
                <Plus className="h-4 w-4" /> Tạo đợt kiểm kê
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" /> Tạo đợt kiểm kê mới
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Mã TS</TableHead>
              <TableHead>Tên tài sản</TableHead>
              <TableHead>Người kiểm kê</TableHead>
              <TableHead className="w-44">Ngày kiểm kê</TableHead>
              <TableHead className="w-32">Trạng thái</TableHead>
              <TableHead>Kết quả</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kiemKeList.map((item) => (
              <TableRow key={item.makiemke}>
                <TableCell className="font-mono text-xs">
                  #{item.mataisan}
                </TableCell>
                <TableCell className="font-medium">{item.tentaisan}</TableCell>
                <TableCell>{item.tennguoikiemke}</TableCell>
                <TableCell>{item.ngaykiemke}</TableCell>
                <TableCell>
                  <Badge variant={getTrangThaiVariant(item.trangthai)}>
                    {item.trangthai}
                  </Badge>
                </TableCell>
                <TableCell className="text-emerald-600 dark:text-emerald-400">
                  {item.KetQua}
                </TableCell>
              </TableRow>
            ))}
            {kiemKeList.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Chưa có dữ liệu kiểm kê
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}

