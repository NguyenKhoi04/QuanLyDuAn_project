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
  // 1. Gọi ngay lập tức, không cần đợi login để kiểm tra xem Supabase có phản hồi không
  fetchTaiSan();

  const initData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // 2. Lấy thông tin user
      const { data: userData, error } = await supabase
        .from("nguoidung")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (userData) {
        setCurrentnguoidung(userData);
        // 3. Có user rồi mới lấy lịch sử báo cáo của chính họ
        fetchMyReports(userData.manguoidung);
      } else {
        console.error("Email này không có trong bảng nguoidung:", session.user.email);
      }
    }
  };

  initData();
}, []);

  const fetchTaiSan = async () => {
    // Join: taisan -> vitri qua mavitri
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
      isread: false
    }));
    setTaiSans(formatted || []);
  };

  const fetchMyReports = async (manguoidung: number) => {
    // Join: thongbao -> taisan qua mataisan
    const { data, error } = await supabase
      .from('thongbao')
      .select('mathongbao, noidung, ngaygui, mataisan, taisan(tentaisan)')
      .eq('manguoidung', manguoidung)
      .eq('loaithongbao', 'incident')
      .order('ngaygui', { ascending: false });

    if (error) return;

    const formatted = data?.map((rp: any) => ({
      ...rp,
      tentaisan: rp.taisan?.tentaisan
    }));
    setMyReports(formatted || []);
  };

  const handleSubmit = async (values: any) => {
    if (!currentnguoidung) return;
    setLoading(true);
    try {
      const selectedTS = taiSans.find(ts => ts.mataisan === values.mataisan);
      
      const success = await notificationService.sendIncidentAlert(
        currentnguoidung.manguoidung,
        values.mataisan,
        selectedTS?.tentaisan || '',
        values.noidung,
        currentnguoidung.email
      );

      if (success) {
        message.success("✅ Đã gửi báo cáo sự cố!");
        form.resetFields();
        fetchMyReports(currentnguoidung.manguoidung);
      }
    } catch (error) {
      message.error("Lỗi khi gửi dữ liệu");
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
      isread ? 
        <Tag color="green">Đã đọc</Tag> : 
        <Tag color="orange">Chưa đọc</Tag>
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
              <Form.Item label="Chọn tài sản" name="mataisan" rules={[{ required: true }]}>
                <Select
                    showSearch
                    placeholder="Tìm tài sản..."
                    optionFilterProp="label" // Cực kỳ quan trọng để tìm kiếm hoạt động
                    options={taiSans.map((ts) => ({
                      value: ts.mataisan,
                      label: `${ts.tentaisan} (${ts.phong})`, // Đảm bảo key này có dữ liệu
                    }))}
                  />
              </Form.Item>

              <Form.Item label="Mô tả sự cố" name="noidung" rules={[{ required: true }]}>
                <Input.TextArea rows={4} placeholder="Ví dụ: Máy chiếu không lên nguồn..." />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading} icon={<Send className="w-4 h-4" />} block>
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