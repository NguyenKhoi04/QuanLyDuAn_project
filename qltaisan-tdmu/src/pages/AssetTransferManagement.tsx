'use client';

import AppShell from "@/components/AppShell";
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
import { ArrowRightLeft, Calendar, Plus } from "lucide-react";
import { useMemo, useState } from "react";

// Theo dõi chuyển giao tài sản giữa các phòng ban
type DieuChuyenTaiSan = {
  MaDieuChuyen: number;
  MaTaiSan: number;
  TenTaiSan: string;
  TuPhongBan: string;
  DenPhongBan: string;
  NgayChuyen: string; // yyyy-mm-dd
};

const initialTransfers: DieuChuyenTaiSan[] = [
  {
    MaDieuChuyen: 1,
    MaTaiSan: 101,
    TenTaiSan: "Máy tính Dell",
    TuPhongBan: "Thực hành Máy tính - Dãy C",
    DenPhongBan: "Thực hành máy tính - Dãy I2",
    NgayChuyen: "2026-03-28",
  },
];

export default function AssetTransferManagement() {
  const [transfers, setTransfers] = useState<DieuChuyenTaiSan[]>(
    initialTransfers,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const emptyForm = useMemo(
    () => ({
      MaTaiSan: "",
      TenTaiSan: "",
      TuPhongBan: "",
      DenPhongBan: "",
      NgayChuyen: "",
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  function resetForm() {
    setForm(emptyForm);
    setFormError("");
  }

  function handleCreate() {
    const maTaiSan = Number(form.MaTaiSan);
    const tenTaiSan = form.TenTaiSan.trim();
    const tuPhongBan = form.TuPhongBan.trim();
    const denPhongBan = form.DenPhongBan.trim();
    const ngayChuyen = form.NgayChuyen;

    if (!maTaiSan || !tenTaiSan || !tuPhongBan || !denPhongBan || !ngayChuyen) {
      setFormError("Vui lòng điền đầy đủ thông tin chuyển giao.");
      return;
    }

    const nextId =
      transfers.reduce((max, t) => Math.max(max, t.MaDieuChuyen), 0) + 1;

    const newTransfer: DieuChuyenTaiSan = {
      MaDieuChuyen: nextId,
      MaTaiSan: maTaiSan,
      TenTaiSan: tenTaiSan,
      TuPhongBan: tuPhongBan,
      DenPhongBan: denPhongBan,
      NgayChuyen: ngayChuyen,
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    setDialogOpen(false);
    resetForm();
  }

  return (
    <AppShell>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="h-6 w-6 text-violet-500" />
                Quản lý chuyển giao tài sản
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Theo dõi lịch sử di chuyển tài sản giữa các phòng ban
              </p>
            </div>

            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <Button
                className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4" /> Chuyển giao mới
              </Button>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Chuyển giao tài sản mới</DialogTitle>
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
                      <Label>Ngày chuyển *</Label>
                      <Input
                        type="date"
                        value={form.NgayChuyen}
                        onChange={(e) =>
                          setForm({ ...form, NgayChuyen: e.target.value })
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
                      <Label>Từ phòng ban *</Label>
                      <Input
                        placeholder="VD: Khoa CNTT"
                        value={form.TuPhongBan}
                        onChange={(e) =>
                          setForm({ ...form, TuPhongBan: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Đến phòng ban *</Label>
                      <Input
                        placeholder="VD: Phòng Thí nghiệm"
                        value={form.DenPhongBan}
                        onChange={(e) =>
                          setForm({ ...form, DenPhongBan: e.target.value })
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
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                    onClick={handleCreate}
                  >
                    Tạo chuyển giao
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Mã TS</TableHead>
                  <TableHead>Tên tài sản</TableHead>
                  <TableHead>Từ phòng ban</TableHead>
                  <TableHead>Đến phòng ban</TableHead>
                  <TableHead className="w-40">Ngày chuyển</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t) => (
                  <TableRow key={t.MaDieuChuyen}>
                    <TableCell className="font-mono text-xs">
                      #{t.MaTaiSan}
                    </TableCell>
                    <TableCell className="font-medium">{t.TenTaiSan}</TableCell>
                    <TableCell className="text-destructive/90">
                      {t.TuPhongBan}
                    </TableCell>
                    <TableCell className="text-emerald-600 dark:text-emerald-400">
                      {t.DenPhongBan}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {t.NgayChuyen}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {transfers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Chưa có dữ liệu chuyển giao
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
    </AppShell>
  );
}

