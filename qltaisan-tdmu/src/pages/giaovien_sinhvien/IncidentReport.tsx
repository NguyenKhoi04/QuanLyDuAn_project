'use client';

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, message, Card, Table } from 'antd';
import { AlertTriangle, Send } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import AppShell from '@/components/AppShell';
import { notificationService } from '@/lib/notificationHelper';
import type { ColumnsType } from 'antd/es/table';
import { Tag } from 'antd';

interface TaiSan {
  mataisan: number;
  tentaisan: string;
  phong: string;
}

interface BaoCao {
  mathongbao: number;
  noidung: string;
  ngaygui: string;
  mataisan: number;
  tentaisan?: string;
  isread: boolean;
}

const IncidentReport: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [taiSans, setTaiSans] = useState<TaiSan[]>([]);
  const [myReports, setMyReports] = useState<BaoCao[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

        useEffect(() => {
          const user = {
            manguoidung: 5,
            hoten: "Nguyễn Thị Sinh Viên",
            email: "sinhvien@tdmu.edu.vn"
          };

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
            }));
            setTaiSans(formatted || []);
          };

          setCurrentUser(user);
          fetchTaiSan();
          fetchMyReports(user.manguoidung);

          // --- THIẾT LẬP REALTIME ---
          const channel = supabase
            .channel('db-changes')
            .on(
              'postgres_changes',
              {
                event: 'UPDATE', // Lắng nghe sự kiện Admin cập nhật trạng thái
                schema: 'public',
                table: 'thongbao',
                filter: `manguoidung=eq.${user.manguoidung}`
              },
              (payload) => {
                console.log('Có thay đổi mới:', payload);
                fetchMyReports(user.manguoidung); // Tải lại danh sách khi Admin nhấn "Đã đọc"
              }
            )
            .subscribe();

          return () => {
            supabase.removeChannel(channel);
          };
        }, []); // Chỉ chạy 1 lần khi mount

        const fetchMyReports = async (manguoidung: number) => {
          const { data, error } = await supabase
            .from('thongbao')
            .select('mathongbao, noidung, ngaygui, mataisan, isread, taisan(tentaisan)') // BẮT BUỘC có isread
            .eq('manguoidung', manguoidung)
            .eq('loaithongbao', 'incident')
            .order('ngaygui', { ascending: false });

          if (error) {
            console.error(error);
            return;
          }

          const formatted = data?.map((rp: any) => ({
            ...rp,
            tentaisan: rp.taisan?.tentaisan,
            isread: rp.isread // Đảm bảo gán đúng giá trị từ DB
          }));
          setMyReports(formatted || []);
        };


  const handleSubmit = async (values: any) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const selectedTS = taiSans.find(ts => ts.mataisan === values.mataisan);
      
      const success = await notificationService.sendIncidentAlert(
        currentUser.manguoidung,
        values.mataisan,
        selectedTS?.tentaisan || '',
        values.noidung,
        currentUser.email
      );

      if (success) {
        message.success("✅ Đã gửi báo cáo sự cố!");
        form.resetFields();
        fetchMyReports(currentUser.manguoidung);
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
                <Select showSearch optionFilterProp="children" placeholder="Tìm tài sản hoặc phòng...">
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


