import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from "@/lib/supabaseClient";
import AppShell from '@/components/AppShell';

interface NhaCungCap {
  manhacungcap: number;
  tennhacungcap: string;
  sodienthoai?: string;
  email?: string;
  diachi?: string;
}

const SupplierManagement: React.FC = () => {
  const [data, setData] = useState<NhaCungCap[]>([]);
  const [filteredData, setFilteredData] = useState<NhaCungCap[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NhaCungCap | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nhacungcap')
      .select('*')
      .order('manhacungcap', { ascending: true });

    if (error) message.error('Lỗi tải dữ liệu: ' + error.message);
    else {
      setData(data || []);
      setFilteredData(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tìm kiếm
  useEffect(() => {
    const filtered = data.filter(item =>
      item.tennhacungcap.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.email && item.email.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.sodienthoai && item.sodienthoai.includes(searchText))
    );
    setFilteredData(filtered);
  }, [searchText, data]);

  const handleSubmit = async (values: any) => { /* giữ nguyên như cũ */ 
    // ... (code handleSubmit giống file cũ)
  };

  const handleEdit = (record: NhaCungCap) => { /* giữ nguyên */ };
  const handleDelete = async (manhacungcap: number) => { /* giữ nguyên */ };

  const columns: ColumnsType<NhaCungCap> = [
    { title: 'Mã NCC', dataIndex: 'manhacungcap', width: 100 },
    { title: 'Tên nhà cung cấp', dataIndex: 'tennhacungcap' },
    { title: 'Số điện thoại', dataIndex: 'sodienthoai' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Địa chỉ', dataIndex: 'diachi' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.manhacungcap)} />
        </Space>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Danh sách nhà cung cấp</h2>
            <p className="text-sm text-muted-foreground">Quản lý thông tin các nhà cung cấp</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRecord(null); form.resetFields(); setIsModalOpen(true); }}>
            Thêm nhà cung cấp
          </Button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="mb-4 flex justify-end">
          <Input
            placeholder="Tìm kiếm tên nhà cung cấp, email, số điện thoại..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="manhacungcap"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Tổng ${total} nhà cung cấp`,
          }}
        />

        {/* Modal giữ nguyên như cũ */}
        <Modal /* ... */ >
          {/* Form giữ nguyên */}
        </Modal>
      </div>
    </AppShell>
  );
};

export default SupplierManagement;