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
  manguoidung,
  mataisan,
  noidung,
  loaithongbao: loaiThongBao,
  email,
}: SendNotificationParams): Promise<boolean> => {
  try {
    // 1. Gửi vào DB ngay lập tức
    const { error } = await supabase.from('thongbao').insert({
      manguoidung: manguoidung,
      mataisan: mataisan,
      noidung: noidung,
      loaithongbao: loaiThongBao,
      ngaygui: new Date().toISOString(),
      isread: false
    });

    if (error) {
      console.error("Lỗi insert thông báo:", error);
      return false;
    }

    // 2. KHÔNG DÙNG 'await' ở đây. Cứ để nó chạy ngầm.
    if (email) {
      sendEmail(email, noidung, loaiThongBao).catch(e => console.error("Gửi email ngầm lỗi:", e));
    }

    // Trả về true ngay khi DB xong, không đợi email
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