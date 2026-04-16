// lib/notificationHelper.ts
import { supabase } from "@/lib/supabaseClient";

export type NotificationType =
  | "maintenance"
  | "incident"
  | "status"
  | "reminder"
  | "general";

interface SendNotificationParams {
  manguoidung: number;
  mataisan?: number;
  noidung: string;
  loaithongbao: NotificationType;
  email?: string;           // Nếu có email thì gửi thêm qua email
}

/**
 * Gửi email qua API
 */


/**
 * Gửi thông báo vào Database (và email nếu có)
 */
// Trong file notificationHelper.ts
export const sendNotification = async ({
  manguoidung: maNguoiDung, mataisan, noidung, loaithongbao: loaiThongBao, email,
}: SendNotificationParams): Promise<boolean> => {
  try {
    // 1. Lưu vào DB (Bắt buộc await để biết đã lưu chưa)
    const { error } = await supabase.from('thongbao').insert({
      manguoidung: maNguoiDung,
      mataisan: mataisan,
      noidung: noidung,
      loaithongbao: loaiThongBao,
      ngaygui: new Date().toISOString(),
      isread: false
    });

    if (error) return false;

    //tạm ngưng gửi email để tránh lỗi khi chưa cấu hình SMTP

    return true; // Trả về true ngay lập tức sau khi xong bước 1
  } catch (err) {
    return false;
  }
};

/**
 * Các hàm tiện ích theo chức năng
 */
export const notificationService = {
  // 1. Gửi thông báo lịch bảo trì
  async sendMaintenanceReminder(
    manguoidung: number,
    mataisan: number,
    tenTaiSan: string,
    ngayBaoTri: string,
    email?: string
  ) {
    return sendNotification({
      manguoidung,
      mataisan,
      noidung: `Đến hạn bảo trì tài sản: ${tenTaiSan} vào ngày ${ngayBaoTri}`,
      loaithongbao: "maintenance",
      email,
    });
  },

  // 2. Nhắc nhở sự cố tài sản
  async sendIncidentAlert(
    manguoidung: number,
    mataisan: number,
    tenTaiSan: string,
    moTaSuCo: string,
    email?: string
  ) {
    return sendNotification({
      manguoidung,
      mataisan,
      noidung: `🚨 Sự cố mới: ${tenTaiSan} - ${moTaSuCo}`,
      loaithongbao: "incident",
      email,
    });
  },

  // 3. Cập nhật trạng thái tài sản
  async sendStatusUpdate(
    manguoidung: number,
    mataisan: number,
    tenTaiSan: string,
    trangThaiMoi: string,
    email?: string
  ) {
    return sendNotification({
      manguoidung,
      mataisan,
      noidung: `Trạng thái tài sản ${tenTaiSan} đã thay đổi thành: ${trangThaiMoi}`,
      loaithongbao: "status",
      email,
    });
  },

  // 4. Thông báo chung
  async sendGeneral(
    manguoidung: number,
    tieuDe: string,
    email?: string
  ) {
    return sendNotification({
      manguoidung,
      noidung: tieuDe,
      loaithongbao: "general",
      email,
    });
  },
};