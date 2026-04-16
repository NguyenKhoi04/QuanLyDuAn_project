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
    fetchTaiSan();

    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Auth Session:", session?.user?.email); // Xem email auth là gì

      if (session?.user) {
        const { data: userData, error } = await supabase
          .from("nguoidung")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          console.log("Đã tìm thấy user trong DB:", userData);
          setCurrentnguoidung(userData);
          fetchMyReports(userData.manguoidung);
        } else {
          // Lỗi ở đây: Auth có nhưng DB không có
          console.error("Không tìm thấy email này trong bảng nguoidung!");
          message.error("Tài khoản của bạn chưa được khởi tạo trong hệ thống!");
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
    setLoading(true);
    
    // Ưu tiên lấy manguoidung từ state, nếu không có thì lấy tạm từ localStorage 
    // (nếu bạn có lưu thông tin đăng nhập vào đó)
    const maND = currentnguoidung?.manguoidung || 1; // 1 là ID mặc định để test nếu chưa có DB
    
    // Phản hồi nhanh cho người dùng
    const msgKey = "updatable";
    message.loading({ content: "Đang xử lý...", key: msgKey });

    try {
      const selectedTS = taiSans.find(ts => ts.mataisan === values.mataisan);
      
      // GỌI SERVICE: Bỏ tham số email đi vì bạn không dùng email
      const success = await notificationService.sendIncidentAlert(
        maND,
        values.mataisan,
        selectedTS?.tentaisan || 'Tài sản không xác định',
        values.noidung
      );

      if (success) {
        message.success({ content: "✅ Đã gửi báo cáo thành công!", key: msgKey, duration: 2 });
        form.resetFields();
        fetchMyReports(maND);
      } else {
        message.error({ content: "❌ Lỗi hệ thống, vui lòng thử lại!", key: msgKey });
      }
    } catch (error) {
      message.error({ content: "Lỗi kết nối!", key: msgKey });
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