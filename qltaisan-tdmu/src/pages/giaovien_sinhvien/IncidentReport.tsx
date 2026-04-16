"use client";

import React, { useState, useEffect } from "react";
import { Button, Form, Input, Select, message, Card, Table, Tag } from "antd";
import { AlertTriangle, Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import AppShell from "@/components/AppShell";
import { notificationService } from "@/lib/notificationHelper";
import { ColumnsType } from "antd/es/table";

interface BaoCao {
  mathongbao: number;
  noidung: string;
  ngaygui: string;
  mataisan: number;
  tentaisan: string;
  isread?: boolean;
}

const IncidentReport: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [taiSans, setTaiSans] = useState<any[]>([]);
  const [myReports, setMyReports] = useState<BaoCao[]>([]);
  const [currentnguoidung, setCurrentnguoidung] = useState<any>(null);

  useEffect(() => {
    // 1. Lấy danh sách tài sản ngay lập tức
    fetchTaiSan();

    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from("nguoidung")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          setCurrentnguoidung(userData);
          fetchMyReports(userData.manguoidung);

          // 2. Thiết lập Realtime (Quan trọng: Phải có manguoidung mới lắng nghe đúng người)
          const channel = supabase
            .channel(`user-reports-${userData.manguoidung}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'thongbao',
                filter: `manguoidung=eq.${userData.manguoidung}`
              },
              () => {
                // Khi admin update cột isread, fetch lại danh sách ngay
                fetchMyReports(userData.manguoidung);
              }
            )
            .subscribe();

          return () => {
            supabase.removeChannel(channel);
          };
        }
      }
    };

    initData();
  }, []);

  const fetchTaiSan = async () => {
    const { data, error } = await supabase
      .from('taisan')
      .select('mataisan, tentaisan, vitri(phong)');

    if (error) {
      message.error("Không thể tải danh sách tài sản");
      return;
    }
    
    const formatted = data?.map((ts: any) => ({
      mataisan: ts.mataisan,
      tentaisan: ts.tentaisan,
      phong: ts.vitri?.phong || 'N/A',
    }));
    setTaiSans(formatted || []);
  };

  const fetchMyReports = async (manguoidung: number) => {
    const { data, error } = await supabase
      .from('thongbao')
      .select('mathongbao, noidung, ngaygui, isread, mataisan, taisan(tentaisan)')
      .eq('manguoidung', manguoidung)
      .eq('loaithongbao', 'incident')
      .order('ngaygui', { ascending: false });

    if (error) return;

    const formatted = data?.map((rp: any) => ({
      ...rp,
      tentaisan: rp.taisan?.tentaisan || 'Tài sản đã bị xóa'
    }));
    setMyReports(formatted || []);
  };

 const handleSubmit = async (values: any) => {
    // 1. Nếu chưa có user detail, dùng tạm ID từ session để không bị chặn
    let userId = currentnguoidung?.manguoidung;
    let userEmail = currentnguoidung?.email;

    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return message.error("Bạn chưa đăng nhập!");
      
      // Thử lấy nhanh lại user
      const { data: u } = await supabase.from('nguoidung').select('*').eq('email', session.user.email).single();
      if (!u) return message.error("Email của bạn chưa được cấp quyền báo cáo!");
      userId = u.manguoidung;
      userEmail = u.email;
    }

    setLoading(true);
    
    // 2. Phản hồi "Lừa" người dùng (Optimistic UI) để cảm giác gửi liền
    message.loading({ content: "Đang gửi báo cáo...", key: "updatable" });

    try {
      const selectedTS = taiSans.find(ts => ts.mataisan === values.mataisan);
      
      // 3. Gửi dữ liệu (Xóa await ở phần email trong service nếu muốn cực nhanh)
      const success = await notificationService.sendIncidentAlert(
        userId,
        values.mataisan,
        selectedTS?.tentaisan || '',
        values.noidung,
        userEmail
      );

      if (success) {
        message.success({ content: "✅ Đã gửi thành công!", key: "updatable", duration: 2 });
        form.resetFields();
        // Cập nhật bảng lịch sử ngay
        fetchMyReports(userId);
      } else {
        message.error({ content: "❌ Gửi thất bại, kiểm tra lại RLS!", key: "updatable", duration: 2 });
      }
    } catch (error) {
      message.error({ content: "Lỗi hệ thống!", key: "updatable" });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<BaoCao> = [
    { 
      title: 'Tài sản', 
      render: (_, record) => (
        <div>
          <b className="block">{record.tentaisan}</b>
          <small className="text-gray-400">ID: TS{record.mataisan}</small>
        </div>
      )
    },
    { title: 'Nội dung', dataIndex: 'noidung' },
    { 
      title: 'Thời gian', 
      dataIndex: 'ngaygui', 
      render: (date) => new Date(date).toLocaleString('vi-VN') 
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isread',
      key: 'isread',
      render: (isread: boolean) => (
        <Tag color={isread ? "green" : "orange"}>
          {isread ? "Đã tiếp nhận" : "Đang chờ"}
        </Tag>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold">Báo cáo Sự cố</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="📋 Gửi yêu cầu" className="shadow">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item label="Chọn tài sản" name="mataisan" rules={[{ required: true, message: 'Vui lòng chọn tài sản!' }]}>
                <Select
                    showSearch
                    placeholder="Tìm tài sản hoặc phòng..."
                    optionFilterProp="label"
                    options={taiSans.map((ts) => ({
                      value: ts.mataisan,
                      label: `${ts.tentaisan} - Phòng: ${ts.phong}`,
                    }))}
                  />
              </Form.Item>

              <Form.Item label="Mô tả sự cố" name="noidung" rules={[{ required: true, message: 'Vui lòng nhập mô tả sự cố!' }]}>
                <Input.TextArea rows={4} placeholder="Ví dụ: Máy chiếu không lên nguồn..." />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading} icon={<Send className="w-4 h-4" />} block danger>
                Gửi Báo Cáo
              </Button>
            </Form>
          </Card>

          <Card title="📜 Lịch sử của bạn" className="shadow">
            <Table columns={columns} dataSource={myReports} rowKey="mathongbao" pagination={{ pageSize: 5 }} />
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default IncidentReport;