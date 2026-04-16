"use client";

import React, { useState, useEffect } from "react";
import { Button, Form, Input, Select, message, Card, Table, Tag } from "antd";
import { AlertTriangle, Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import AppShell from "@/components/AppShell";
import { notificationService } from "@/lib/notificationHelper";
import { ColumnsType } from "antd/es/table";

const IncidentReport: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [taiSans, setTaiSans] = useState<any[]>([]);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: userData } = await supabase
          .from("nguoidung")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          setCurrentUser(userData);
          fetchTaiSan();
          fetchMyReports(userData.manguoidung);

          const channel = supabase
            .channel("user-notis")
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "thongbao",
                filter: `manguoidung=eq.${userData.manguoidung}`,
              },
              () => {
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

  // --- HÀM FETCH TÀI SẢN (ĐÃ FIX) ---
  const fetchTaiSan = async () => {
  // Chú ý dấu ` ở đầu và cuối chuỗi select
  const { data, error } = await supabase
    .from('taisan')
    .select(`
      mataisan, 
      tentaisan, 
      mavitri,
      vitri (
        phong
      )
    `);

  if (error) {
    console.error("Lỗi fetch tài sản:", error.message);
    return;
  }

  console.log("Dữ liệu tài sản thô:", data); // Kiểm tra xem data có [] không

  const formattedData = data?.map((item: any) => ({
    mataisan: item.mataisan,
    tentaisan: item.tentaisan,
    phong: item.vitri?.phong || 'Chưa xác định'
  }));

  setTaiSans(formattedData || []);
};

  // --- HÀM FETCH BÁO CÁO (ĐÃ FIX) ---
  const fetchMyReports = async (manguoidung: number) => {
  const { data, error } = await supabase
    .from('thongbao')
    .select(`
      mathongbao,
      noidung,
      ngaygui,
      isread,
      mataisan,
      taisan (
        tentaisan
      )
    `) // Phải có dấu backtick ở đây
    .eq('manguoidung', manguoidung)
    .eq('loaithongbao', 'incident')
    .order('ngaygui', { ascending: false });

  if (error) {
    console.error("Lỗi fetch báo cáo:", error.message);
    return;
  }

  const formattedReports = data?.map((item: any) => ({
    ...item,
    tentaisan: item.taisan?.tentaisan || "N/A"
  }));

  setMyReports(formattedReports || []);
};

  const handleSubmit = async (values: any) => {
    if (!currentUser) return message.error("Lỗi xác thực!");
    setLoading(true);

    const selectedTS = taiSans.find((ts) => ts.mataisan === values.mataisan);

    const success = await notificationService.sendIncidentAlert(
      currentUser.manguoidung,
      values.mataisan,
      selectedTS?.tentaisan || "",
      values.noidung,
      currentUser.email
    );

    if (success) {
      message.success("✅ Đã gửi báo cáo!");
      form.resetFields();
      fetchMyReports(currentUser.manguoidung);
    } else {
      message.error("❌ Gửi báo cáo thất bại!");
    }
    setLoading(false);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Tài sản",
      key: "taisan",
      render: (_, record) => (
        <div>
          <b className="block">{record.tentaisan}</b>
          <small className="text-gray-500">Phòng: {record.phong}</small>
        </div>
      ),
    },
    { title: "Nội dung", dataIndex: "noidung", key: "noidung" },
    {
      title: "Thời gian",
      dataIndex: "ngaygui",
      key: "ngaygui",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isread",
      key: "isread",
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
              <Form.Item
                label="Chọn tài sản"
                name="mataisan"
                rules={[{ required: true, message: 'Vui lòng chọn tài sản!' }]}
              >
                <Select
                  showSearch
                  placeholder="Tìm tài sản hoặc phòng..."
                  optionFilterProp="label" // Sửa thành label
                  options={taiSans.map(ts => ({
                    value: ts.mataisan,
                    label: `${ts.tentaisan} - Phòng: ${ts.phong}` // Đây là nội dung hiển thị và tìm kiếm
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Mô tả sự cố"
                name="noidung"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
              >
                <Input.TextArea rows={4} placeholder="Ví dụ: Máy chiếu không lên nguồn..." />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<Send className="w-4 h-4" />}
                block
                danger
              >
                Gửi Báo Cáo
              </Button>
            </Form>
          </Card>

          <Card title="📜 Lịch sử của bạn" className="shadow">
            <Table
              columns={columns}
              dataSource={myReports}
              rowKey="mathongbao"
              pagination={{ pageSize: 6 }}
              locale={{ emptyText: 'Chưa có báo cáo nào' }}
            />
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default IncidentReport;