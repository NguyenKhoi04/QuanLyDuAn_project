"use client";

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
import { ArrowRightLeft, Calendar, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Theo dõi chuyển giao tài sản giữa các phòng ban
type DieuChuyenTaiSan = {
  madieuchuyen: number;
  mataisan: number;
  macode: string;
  tentaisan: string;
  tuphongban: string;        // Tên phòng ban "Từ"
  denphongban: string;       // Tên phòng ban "Đến"
  ngaychuyen: string;
};

type PhongBan = {
  maphongban: number;
  tenphongban: string;
};

export default function AssetTransferManagement() {
  const [transfers, setTransfers] = useState<DieuChuyenTaiSan[]>([]); // Danh sách phòng ban
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [phongBanList, setPhongBanList] = useState<{ maphongban: number; tenphongban: string }[]>([]);

  const emptyForm = {
    mataisan: "",
    tuphongban: "",     // ID
    denphongban: "",    // ID
    ngaychuyen: "",
  };

  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
    setFormError("");
  };

  // Fetch danh sách chuyển giao
  const fetchTransfers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dieuchuyentaisan")
      .select(`
        madieuchuyen,
        mataisan,
        tuphongban,
        denphongban,
        ngaychuyen,
        taisan (macode, tentaisan),
        phongban_tu:phongban!dieuchuyentaisan_tuphongban_fkey (tenphongban),
        phongban_den:phongban!dieuchuyentaisan_denphongban_fkey (tenphongban)
      `)
      .order("ngaychuyen", { ascending: false });

    if (error) console.error(error);
    else {
      const mapped = data?.map((item: any) => ({
        madieuchuyen: item.madieuchuyen,
        mataisan: item.mataisan,
        macode: item.taisan?.macode || "N/A",
        tentaisan: item.taisan?.tentaisan || "Không tìm thấy",
        tuphongban: item.phongban_tu?.tenphongban || "Không rõ",
        denphongban: item.phongban_den?.tenphongban || "Không rõ",
        ngaychuyen: item.ngaychuyen,
      })) || [];
      setTransfers(mapped);
    }
    setLoading(false);
  };

  // Fetch danh sách phòng ban để dùng trong Select
  const fetchPhongBan = async () => {
    const { data, error } = await supabase
      .from("phongban")
      .select("maphongban, tenphongban")
      .order("tenphongban");

    if (!error && data) setPhongBanList(data);
  };

  useEffect(() => {
    fetchTransfers();
    fetchPhongBan();
  }, []);

  // ====================== CREATE ======================
  const handleCreate = async () => {
    const { mataisan, tuphongban, denphongban, ngaychuyen } = form;

    if (!mataisan || !tuphongban || !denphongban || !ngaychuyen) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    const { error } = await supabase.from("dieuchuyentaisan").insert([
      {
        mataisan: Number(mataisan),
        tuphongban: Number(tuphongban),
        denphongban: Number(denphongban),
        ngaychuyen,
      },
    ]);

    if (error) {
      setFormError("Lỗi: " + error.message);
    } else {
      resetForm();
      setDialogOpen(false);
      fetchTransfers();
    }
  };

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

        <Button
          className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" /> Chuyển giao mới
        </Button>
      </div>

      {/* Bảng hiển thị */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        {loading ? (
          <p className="text-center py-8">Đang tải dữ liệu...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Mã Code</TableHead>
                <TableHead>Mã TS</TableHead>
                <TableHead>Tên tài sản</TableHead>
                <TableHead>Từ phòng ban</TableHead>
                <TableHead>Đến phòng ban</TableHead>
                <TableHead className="w-40">Ngày chuyển</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((t) => (
                <TableRow key={t.madieuchuyen}>
                  <TableCell className="font-mono font-medium">{t.macode}</TableCell>
                  <TableCell className="font-mono text-xs">#{t.mataisan}</TableCell>
                  <TableCell className="font-medium">{t.tentaisan}</TableCell>
                  <TableCell className="text-orange-600">{t.tuphongban}</TableCell>
                  <TableCell className="text-emerald-600">{t.denphongban}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {t.ngaychuyen}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {transfers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Chưa có dữ liệu chuyển giao
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chuyển giao tài sản mới</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã tài sản *</Label>
                <Input
                  type="number"
                  placeholder="VD: 101"
                  value={form.mataisan}
                  onChange={(e) => setForm({ ...form, mataisan: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày chuyển *</Label>
                <Input
                  type="date"
                  value={form.ngaychuyen}
                  onChange={(e) => setForm({ ...form, ngaychuyen: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Từ phòng ban *</Label>
                <Select value={form.tuphongban} onValueChange={(v) => setForm({ ...form, tuphongban: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    {phongBanList.map((pb) => (
                      <SelectItem key={pb.maphongban} value={String(pb.maphongban)}>
                        {pb.tenphongban}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Đến phòng ban *</Label>
                <Select value={form.denphongban} onValueChange={(v) => setForm({ ...form, denphongban: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    {phongBanList.map((pb) => (
                      <SelectItem key={pb.maphongban} value={String(pb.maphongban)}>
                        {pb.tenphongban}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>
              Hủy
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleCreate}>
              Tạo chuyển giao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

