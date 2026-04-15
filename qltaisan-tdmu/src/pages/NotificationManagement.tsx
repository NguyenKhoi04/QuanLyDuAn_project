// Trang quảng lý thông báo - NotificationManagement.tsx
// app/notifications/page.tsx  hoặc  components/NotificationManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Bell, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import AppShell from '@/components/AppShell';
import type { ColumnsType } from 'antd/es/table';

interface Notification {
  mathongbao: number;
  noidung: string;
  ngaygui: string;
  isread: boolean;
  loaithongbao: string;
  mataisan?: number;
}

const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('thongbao')
      .select('*')
      .order('ngaygui', { ascending: false });

    if (error) message.error('Lỗi tải thông báo');
    else setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    await supabase.from('thongbao').update({ isread: true }).eq('mathongbao', id);
    fetchNotifications();
  };

  const deleteNotification = async (id: number) => {
    if (!confirm('Xóa thông báo này?')) return;
    await supabase.from('thongbao').delete().eq('mathongbao', id);
    fetchNotifications();
    message.success('Đã xóa');
  };

  const filteredNotifications = notifications.filter(n =>
    n.noidung.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Notification> = [
    {
      title: 'Loại',
      dataIndex: 'loaithongbao',
      render: (type) => {
        const colors: any = { maintenance: 'blue', incident: 'red', status: 'green' };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
      },
    },
    { title: 'Nội dung', dataIndex: 'noidung', key: 'noidung' },
    { 
      title: 'Thời gian', 
      dataIndex: 'ngaygui', 
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isread',
      render: (read) => read ? 
        <Tag color="green">Đã đọc</Tag> : 
        <Tag color="orange">Chưa đọc</Tag>,
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Space>
          {!record.isread && (
            <Button onClick={() => markAsRead(record.mathongbao)} size="small">
              Đánh dấu đã đọc
            </Button>
          )}
          <Button danger size="small" onClick={() => deleteNotification(record.mathongbao)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Quản lý Thông báo</h2>
            <p className="text-muted-foreground">Theo dõi và quản lý tất cả thông báo hệ thống</p>
          </div>
          <Button onClick={fetchNotifications}>Làm mới</Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm nội dung thông báo..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredNotifications}
          rowKey="mathongbao"
          loading={loading}
          pagination={{ pageSize: 15 }}
        />
      </div>
    </AppShell>
  );
};

export default NotificationManagement;