'use client';

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, message, Card, Table, Tag } from 'antd';
import { AlertTriangle, Send } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import AppShell from '@/components/AppShell';
import { notificationService } from '@/lib/notificationHelper';
import { ColumnsType } from 'antd/es/table';

const IncidentReport: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [taiSans, setTaiSans] = useState<any[]>([]);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const initData = async () => {
      // 1. Lấy user đang đăng nhập từ Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Lấy thông tin chi tiết (hoten, manguoidung) từ bảng nguoidung
        const { data: userData } = await supabase
          .from('nguoidung')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (userData) {
          setCurrentUser(userData);
          fetchTaiSan();
          fetchMyReports(userData.manguoidung);

          // 2. Đăng ký Realtime: Admin đọc là cập nhật ngay
          const channel = supabase
            .channel('user-notis')
            .on('postgres_changes', {
              event: 'UPDATE',
              schema: 'public',
              table: 'thongbao',
              filter: `manguoidung=eq.${userData.manguoidung}`
            }, () => {
              fetchMyReports(userData.manguoidung); // Load lại khi admin update isread
            })
            .subscribe();

          return () => { supabase.removeChannel(channel); };
        }
      }
    };

    initData();
  }, []);

  const fetchTaiSan = async () => {
    const { data } = await supabase
      .from('taisan')
      .select('mataisan, tentaisan, vitri(phong)');
    
    // const formatted = data?.map((ts: any) => ({
    //   value: ts.mataisan,
    //   label: `${ts.tentaisan} - ${ts.vitri?.phong || 'N/A'}`,
    //   name: ts.tentaisan
    // }));
    const formatted = data?.map((ts: any) => ({
    mataisan: ts.mataisan,
    tentaisan: ts.tentaisan,
    phong: ts.vitri?.phong || 'N/A'
  }));
    setTaiSans(formatted || []);
  };

  const fetchMyReports = async (userId: number) => {
    const { data } = await supabase
      .from('thongbao')
      .select('mathongbao, noidung, ngaygui, isread, taisan(tentaisan)')
      .eq('manguoidung', userId)
      .eq('loaithongbao', 'incident')
      .order('ngaygui', { ascending: false });

    setMyReports(data?.map((r: any) => ({ ...r, tentaisan: r.taisan?.tentaisan })) || []);
  };

  const handleSubmit = async (values: any) => {
    if (!currentUser) return message.error("Lỗi xác thực!");
    setLoading(true);
    
    const selectedTS = taiSans.find(ts => ts.value === values.mataisan);
    const success = await notificationService.sendIncidentAlert(
      currentUser.manguoidung, // Ghi nhận đúng ID người đang dùng
      values.mataisan,
      selectedTS?.name || '',
      values.noidung,
      currentUser.email
    );

    if (success) {
      message.success("✅ Đã gửi báo cáo!");
      form.resetFields();
      fetchMyReports(currentUser.manguoidung);
    }
    setLoading(false);
  };

  interface BaoCao {
    mathongbao: number;
    tentaisan: string;
    noidung: string;
    ngaygui: Date;
    isread: boolean;
  }
  

  const columns: ColumnsType<BaoCao> = [
    { 
      title: 'Tài sản', 
      render: (_, record) => (
        <div>
          <b className="block">{record.tentaisan}</b>
          <small className="text-gray-400">ID: TS{record.mathongbao}</small>
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
              {/* <Form.Item label="Chọn tài sản" name="mataisan" rules={[{ required: true }]}>
                <Select showSearch optionFilterProp="children" placeholder="Tìm tài sản hoặc phòng...">
                  {taiSans.map(ts => (
                    <Select.Option key={ts.mataisan} value={ts.mataisan}>
                      {ts.tentaisan} - Phòng: {ts.phong}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item> */}

              
              <Form.Item label="Chọn tài sản" name="mataisan" rules={[{ required: true }]}>
                  <Select 
                      showSearch 
                      placeholder="Tìm tài sản hoặc phòng..."
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                      }
                    >
                    {taiSans.map(ts => (
                      <Select.Option key={ts.mataisan} value={ts.mataisan}>
                        {ts.tentaisan} - Phòng: {ts.phong}
                      </Select.Option>
                    ))}
                  </Select>
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


