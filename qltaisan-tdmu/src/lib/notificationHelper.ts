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
  email?: string;           // Nếu có email thì gửi thêm qua email
}

/**
 * Gửi email qua API
 */
const sendEmail = async (toEmail: string, content: string, type: NotificationType) => {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: toEmail,
        content: content,
        type: type,
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gửi email thất bại');

    console.log('✅ Email đã được gửi thành công');
    return true;
  } catch (err) {
    console.error('Gửi email thất bại:', err);
    return false;
  }
};

/**
 * Gửi thông báo vào Database (và email nếu có)
 */
export const sendNotification = async ({
  maNguoiDung,
  mataisan,
  noidung,
  loaiThongBao,
  email,
}: SendNotificationParams): Promise<boolean> => {
  try {
    // 1. Lưu vào bảng ThongBao
    const { error } = await supabase.from('thongbao').insert({
      manguoidung: maNguoiDung,
      mataisan: mataisan,
      noidung: noidung,
      loaithongbao: loaiThongBao,
    });

    if (error) {
      console.error("Lỗi insert thông báo:", error);
      return false;
    }

    // 2. Gửi email nếu có địa chỉ email
    if (email) {
      await sendEmail(email, noidung, loaiThongBao);
    }

    return true;
  } catch (err) {
    console.error("Gửi thông báo thất bại:", err);
    return false;
  }
};

/**
 * Các hàm tiện ích theo chức năng
 */
export const notificationService = {
  // 1. Gửi thông báo lịch bảo trì
  async sendMaintenanceReminder(
    maNguoiDung: number,
    mataisan: number,
    tenTaiSan: string,
    ngayBaoTri: string,
    email?: string
  ) {
    return sendNotification({
      maNguoiDung,
      mataisan,
      noidung: `Đến hạn bảo trì tài sản: ${tenTaiSan} vào ngày ${ngayBaoTri}`,
      loaiThongBao: "maintenance",
      email,
    });
  },

  // 2. Nhắc nhở sự cố tài sản
  async sendIncidentAlert(
    maNguoiDung: number,
    mataisan: number,
    tenTaiSan: string,
    moTaSuCo: string,
    email?: string
  ) {
    return sendNotification({
      maNguoiDung,
      mataisan,
      noidung: `🚨 Sự cố mới: ${tenTaiSan} - ${moTaSuCo}`,
      loaiThongBao: "incident",
      email,
    });
  },

  // 3. Cập nhật trạng thái tài sản
  async sendStatusUpdate(
    maNguoiDung: number,
    mataisan: number,
    tenTaiSan: string,
    trangThaiMoi: string,
    email?: string
  ) {
    return sendNotification({
      maNguoiDung,
      mataisan,
      noidung: `Trạng thái tài sản ${tenTaiSan} đã thay đổi thành: ${trangThaiMoi}`,
      loaiThongBao: "status",
      email,
    });
  },

  // 4. Thông báo chung
  async sendGeneral(
    maNguoiDung: number,
    tieuDe: string,
    email?: string
  ) {
    return sendNotification({
      maNguoiDung,
      noidung: tieuDe,
      loaiThongBao: "general",
      email,
    });
  },
};