// lib/notificationHelper.ts
import { supabase } from "@/lib/supabaseClient";

export type NotificationType =
  | "maintenance"
  | "incident"
  | "status"
  | "reminder"
  | "general";

interface SendNotificationParams {
  maNguoiDung: number;
  mataisan?: number;
  noidung: string;
  loaiThongBao: NotificationType;
  email?: string; // Thêm trường email nếu muốn gửi qua email
}

/**
 * Gửi thông báo vào database
 */
export const sendNotification = async ({
  maNguoiDung,
  mataisan,
  noidung,
  loaiThongBao,
  email,
}: SendNotificationParams) => {
  const { error } = await supabase.from("thongbao").insert({
    manguoidung: maNguoiDung,
    mataisan: mataisan,
    noidung: noidung,
    loaithongbao: loaiThongBao,
  });

  if (error) {
    console.error("Gửi thông báo thất bại:", error);
    return false;
  }
  //Gửi email nếu có trường email (tùy chọn)
  if (email) {
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: `Thông báo mới: ${loaiThongBao}`,
          text: noidung,
        }),
      });
    } catch (emailError) {
      console.error("Gửi email thất bại:", emailError);
    }
  }
  return true;
};

/**
 * Các hàm tiện ích gửi thông báo theo chức năng
 */
export const notificationService = {
  // 1. Gửi thông báo lịch bảo trì
  async sendMaintenanceReminder(
    maNguoiDung: number,
    mataisan: number,
    tenTaiSan: string,
    ngayBaoTri: string,
  ) {
    return sendNotification({
      maNguoiDung,
      mataisan,
      noidung: `Đến hạn bảo trì tài sản: ${tenTaiSan} vào ngày ${ngayBaoTri}`,
      loaiThongBao: "maintenance",
    });
  },

  // 2. Nhắc nhở sự cố tài sản
  async sendIncidentAlert(
    maNguoiDung: number,
    mataisan: number,
    tenTaiSan: string,
    moTaSuCo: string,
  ) {
    return sendNotification({
      maNguoiDung,
      mataisan,
      noidung: `🚨 Sự cố mới: ${tenTaiSan} - ${moTaSuCo}`,
      loaiThongBao: "incident",
    });
  },

  // 3. Cập nhật trạng thái tài sản
  async sendStatusUpdate(
    maNguoiDung: number,
    mataisan: number,
    tenTaiSan: string,
    trangThaiMoi: string,
  ) {
    return sendNotification({
      maNguoiDung,
      mataisan,
      noidung: `Trạng thái tài sản ${tenTaiSan} đã thay đổi thành: ${trangThaiMoi}`,
      loaiThongBao: "status",
    });
  },

  // 4. Thông báo chung
  async sendGeneral(maNguoiDung: number, tieuDe: string) {
    return sendNotification({
      maNguoiDung,
      noidung: tieuDe,
      loaiThongBao: "general",
    });
  },
};
