import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, message, Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from "@/lib/supabaseClient";
import AppShell from '@/components/AppShell';

interface LoaiTaiSan {
  maloai: number;
  tenloai: string;
  mota: string | null;
}

const AssetClassification: React.FC = () => {
  const [data, setData] = useState<LoaiTaiSan[]>([]);
  const [filteredData, setFilteredData] = useState<LoaiTaiSan[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LoaiTaiSan | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('loaitaisan')
      .select('*')
      .order('maloai', { ascending: true });

    if (error) {
      message.error('Lỗi tải dữ liệu: ' + error.message);
    } else {
      setData(data || []);
      setFilteredData(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tìm kiếm realtime
  useEffect(() => {
    const filtered = data.filter(item =>
      item.tenloai.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.mota && item.mota.toLowerCase().includes(searchText.toLowerCase()))
    );
    setFilteredData(filtered);
  }, [searchText, data]);

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        const { error } = await supabase
          .from('loaitaisan')
          .update({ tenloai: values.tenloai, mota: values.mota })
          .eq('maloai', editingRecord.maloai);
        if (error) throw error;
        message.success('Cập nhật thành công');
      } else {
        const { error } = await supabase.from('loaitaisan').insert(values);
        if (error) throw error;
        message.success('Thêm mới thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingRecord(null);
      fetchData();
    } catch (error: any) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const handleEdit = (record: LoaiTaiSan) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (maloai: number) => {
    if (!confirm('Xác nhận xóa loại tài sản này?')) return;
    const { error } = await supabase.from('loaitaisan').delete().eq('maloai', maloai);
    if (error) message.error(error.message);
    else {
      message.success('Xóa thành công');
      fetchData();
    }
  };

  const columns: ColumnsType<LoaiTaiSan> = [
    { title: 'Mã loại', dataIndex: 'maloai', key: 'maloai', width: 100 },
    { title: 'Tên loại tài sản', dataIndex: 'tenloai', key: 'tenloai' },
    { title: 'Mô tả', dataIndex: 'mota', key: 'mota' },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.maloai)} />
        </Space>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Phân loại tài sản</h2>
            <p className="text-sm text-muted-foreground">Quản lý các loại tài sản trong hệ thống</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Thêm loại tài sản
          </Button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="mb-4 flex justify-end">
          <Input
            placeholder="Tìm kiếm theo tên loại hoặc mô tả..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 350 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="maloai"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Tổng ${total} loại tài sản`,
          }}
        />

        {/* Modal */}
        <Modal
          title={editingRecord ? "Sửa loại tài sản" : "Thêm loại tài sản mới"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText={editingRecord ? "Cập nhật" : "Thêm mới"}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="Tên loại tài sản" name="tenloai" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Mô tả" name="mota">
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppShell>
  );
};

export default AssetClassification;