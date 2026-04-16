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
    // Giả lập user (Nên thay bằng auth từ supabase.auth.getSession())
    const user = {
      manguoidung: 5,
      hoten: "Nguyễn Thị Sinh Viên",
      email: "sinhvien@tdmu.edu.vn"
    };
    setCurrentUser(user);
    fetchTaiSan();
    fetchMyReports(user.manguoidung);
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


// // app/incident-report/page.tsx   hoặc   components/IncidentReport.tsx
// // Đây là một trang React component cho phép giảng viên và sinh viên báo cáo sự cố tài sản.
// // để xem sau
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Button, Form, Input, Select, message, Card, Table } from 'antd';
// import { AlertTriangle, Send } from 'lucide-react';
// import { supabase } from '@/lib/supabaseClient';
// import AppShell from '@/components/AppShell';
// import { notificationService } from '@/lib/notificationHelper';
// import type { ColumnsType } from 'antd/es/table';

// interface TaiSan {
//   mataisan: number;
//   tentaisan: string;
//   phong?: string;
// }

// interface BaoCao {
//   mathongbao: number;
//   noidung: string;
//   ngaygui: string;
//   mataisan: number;
//   tentaisan?: string;
// }

// const IncidentReport: React.FC = () => {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const [taiSans, setTaiSans] = useState<TaiSan[]>([]);
//   const [myReports, setMyReports] = useState<BaoCao[]>([]);
//   const [currentUser, setCurrentUser] = useState<any>(null);

//   // Giả sử bạn đã có thông tin user từ Auth (có thể lấy từ session)
//   useEffect(() => {
//     const user = {
//       manguoidung: 5,           // Thay bằng ID thật của user đang đăng nhập
//       hoten: "Nguyễn Thị Sinh Viên",
//       mavaitro: 5,
//       email: "sinhvien@tdmu.edu.vn"
//     };
//     setCurrentUser(user);
//     fetchTaiSan();
//     fetchMyReports(user.manguoidung);
//   }, []);

//   // const fetchTaiSan = async () => {
//   //   const { data } = await supabase
//   //     .from('taisan')
//   //     .select('mataisan, tentaisan, phong');
//   //   setTaiSans(data || []);
//   // };

//   const fetchTaiSan = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('taisan') // Tên bảng phải khớp 100%
//         .select('mataisan, tentaisan, phong');

//       if (error) {
//         console.error("Lỗi truy vấn:", error.message);
//         return;
//       }
//       setTaiSans(data || []);
//     } catch (err) {
//       console.error("Lỗi kết nối:", err);
//     }
//   };

//   const fetchMyReports = async (manguoidung: number) => {
//     const { data } = await supabase
//       .from('thongbao')
//       .select('*')
//       .eq('manguoidung', manguoidung)
//       .eq('loaithongbao', 'incident')
//       .order('ngaygui', { ascending: false });
    
//     setMyReports(data || []);
//   };

//   const handleSubmit = async (values: any) => {
//     if (!currentUser) return;

//     setLoading(true);
//     try {
//       const selectedTS = taiSans.find(ts => ts.mataisan === values.mataisan);

//       const noiDung = `🚨 Báo hỏng: ${selectedTS?.tentaisan} - ${values.noidung}`;

//       // Gửi thông báo vào bảng thongbao
//       const success = await notificationService.sendIncidentAlert(
//         currentUser.manguoidung,
//         values.mataisan,
//         selectedTS?.tentaisan || '',
//         values.noidung,
//         currentUser.email
//       );

//       if (success) {
//         message.success("✅ Báo cáo sự cố đã được gửi thành công!");
//         form.resetFields();
//         fetchMyReports(currentUser.manguoidung);
//       } else {
//         message.error("Gửi báo cáo thất bại");
//       }
//     } catch (error) {
//       message.error("Có lỗi xảy ra");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const columns: ColumnsType<BaoCao> = [
//     { 
//       title: 'Tài sản', 
//       dataIndex: 'mataisan', 
//       render: (_, record) => `TS${record.mataisan.toString().padStart(3, '0')}` 
//     },
//     { title: 'Nội dung báo cáo', dataIndex: 'noidung' },
//     { 
//       title: 'Thời gian', 
//       dataIndex: 'ngaygui', 
//       render: (date) => new Date(date).toLocaleString('vi-VN') 
//     },
//   ];

//   return (
//     <AppShell>
//       <div className="p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <AlertTriangle className="h-8 w-8 text-red-500" />
//           <div>
//             <h1 className="text-3xl font-bold">Báo cáo Sự cố Tài sản</h1>
//             <p className="text-muted-foreground">Dành cho Giảng viên và Sinh viên</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Form báo cáo */}
//           <Card title="📋 Báo cáo sự cố mới" className="shadow">
//             <Form form={form} layout="vertical" onFinish={handleSubmit}>
//               <Form.Item
//                 label="Chọn tài sản"
//                 name="mataisan"
//                 rules={[{ required: true, message: 'Vui lòng chọn tài sản' }]}
//               >
//                 <Select placeholder="Chọn tài sản bị hỏng">
//                   {taiSans.map(ts => (
//                     <Select.Option key={ts.mataisan} value={ts.mataisan}>
//                       {ts.tentaisan} - ({ts.phong})
//                     </Select.Option>
//                   ))}
//                 </Select>
//               </Form.Item>

//               <Form.Item
//                 label="Mô tả sự cố"
//                 name="noidung"
//                 rules={[{ required: true, message: 'Vui lòng mô tả sự cố' }]}
//               >
//                 <Input.TextArea 
//                   rows={5} 
//                   placeholder="Mô tả chi tiết sự cố (ví dụ: Không bật được, màn hình bị nứt, dây nguồn đứt...)" 
//                 />
//               </Form.Item>

//               <Button 
//                 type="primary" 
//                 htmlType="submit" 
//                 loading={loading}
//                 icon={<Send className="h-4 w-4" />}
//                 size="large"
//                 block
//               >
//                 Gửi Báo Cáo
//               </Button>
//             </Form>
//           </Card>

//           {/* Lịch sử báo cáo của tôi */}
//           <Card title="📜 Lịch sử báo cáo của tôi" className="shadow">
//             <Table
//               columns={columns}
//               dataSource={myReports}
//               rowKey="mathongbao"
//               pagination={{ pageSize: 5 }}
//             />
//           </Card>
//         </div>
//       </div>
//     </AppShell>
//   );
// };

// export default IncidentReport;