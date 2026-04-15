// DocumentManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Typography, Upload, message, Tag, Tooltip,
} from 'antd';
import {
  DownloadOutlined, EyeOutlined, HistoryOutlined, UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from "@/lib/supabaseClient"; // ← Import Supabase client của bạn

const { Title, Text } = Typography;

interface DocumentVersion {
  id: string;
  version: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  url: string;
  maTaiLieu?: string;
}

interface Document {
  id: string;
  maTaiSan: number;
  documentName: string;
  currentVersion: string;
  totalVersions: number;
  lastUpdated: string;
  versions: DocumentVersion[];
}

const DocumentManagement: React.FC<{ maTaiSan?: number }> = ({ maTaiSan }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch tài liệu theo MaTaiSan
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('TepDinhKem')
        .select('*')
        .order('NgayTaiLen', { ascending: false });

      if (maTaiSan) {
        query = query.eq('MaTaiSan', maTaiSan);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Nhóm theo tài liệu (theo MaTaiLieu hoặc TenFile gốc)
      const grouped = data.reduce((acc: any, item: any) => {
        const key = item.MaTaiLieu || item.TenFile;
        if (!acc[key]) {
          acc[key] = {
            id: key,
            maTaiSan: item.MaTaiSan,
            documentName: item.TenFile,
            versions: [],
          };
        }
        acc[key].versions.push({
          id: item.id,
          version: item.PhienBan || 'v1.0',
          fileName: item.TenFile,
          fileSize: item.KichThuoc || '—',
          uploadedBy: item.NguoiTaiLen || '—',
          uploadDate: new Date(item.NgayTaiLen).toLocaleString('vi-VN'),
          url: item.DuongDan,
          maTaiLieu: item.MaTaiLieu,
        });
        return acc;
      }, {});

      const result: Document[] = Object.values(grouped).map((doc: any) => {
        const sortedVersions = doc.versions.sort((a: any, b: any) => 
          b.version.localeCompare(a.version)
        );
        return {
          ...doc,
          currentVersion: sortedVersions[0]?.version || 'v1.0',
          totalVersions: sortedVersions.length,
          lastUpdated: sortedVersions[0]?.uploadDate || '',
          versions: sortedVersions,
        };
      });

      setDocuments(result);
    } catch (error: any) {
      message.error('Lỗi khi tải danh sách tài liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [maTaiSan]);

  const handleView = (version: DocumentVersion) => {
    window.open(version.url, '_blank');
  };

  const handleDownload = (version: DocumentVersion) => {
    const link = document.createElement('a');
    link.href = version.url;
    link.download = version.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success(`Đang tải: ${version.fileName}`);
  };

  const showHistory = (doc: Document) => {
    setSelectedDocument(doc);
    setIsHistoryModalVisible(true);
  };

  // Upload file mới
  const handleUpload = async (file: any, isNewVersion: boolean = true) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('TaiLieuDinhKem') // Bucket name
        .upload(filePath, file);

      if (error) throw error;

      const publicUrl = supabase.storage.from('TaiLieuDinhKem').getPublicUrl(filePath).data.publicUrl;

      // Insert vào database
      const { error: dbError } = await supabase
        .from('TepDinhKem')
        .insert({
          MaTaiSan: maTaiSan || 1,
          TenFile: file.name,
          DuongDan: publicUrl,
          MaTaiLieu: isNewVersion ? selectedDocument?.id : null,
          PhienBan: isNewVersion ? `v${(selectedDocument?.totalVersions || 0) + 1}.0` : 'v1.0',
          KichThuoc: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          NguoiTaiLen: 'Current User', // Thay bằng auth.user.email sau
        });

      if (dbError) throw dbError;

      message.success('Tải lên thành công!');
      fetchDocuments(); // Refresh danh sách
    } catch (error: any) {
      message.error('Lỗi upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Columns cho bảng chính
  const columns: ColumnsType<Document> = [
    { title: 'Tên tài liệu', dataIndex: 'documentName', key: 'documentName' },
    { 
      title: 'Phiên bản hiện tại', 
      dataIndex: 'currentVersion', 
      key: 'currentVersion',
      render: (v) => <Tag color="blue">{v}</Tag>
    },
    { 
      title: 'Số phiên bản', 
      dataIndex: 'totalVersions', 
      key: 'totalVersions',
      render: (v) => `${v} phiên bản`
    },
    { title: 'Cập nhật lần cuối', dataIndex: 'lastUpdated', key: 'lastUpdated' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<HistoryOutlined />} onClick={() => showHistory(record)}>
            Lịch sử
          </Button>
          <Upload
            showUploadList={false}
            beforeUpload={(file) => { handleUpload(file, true); return false; }}
          >
            <Button icon={<UploadOutlined />} type="primary" ghost>
              Phiên bản mới
            </Button>
          </Upload>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Quản lý tài liệu đính kèm</Title>

      <Upload
        showUploadList={false}
        beforeUpload={(file) => { handleUpload(file, false); return false; }}
      >
        <Button type="primary" icon={<UploadOutlined />} size="large" loading={uploading}>
          Tải lên tài liệu mới
        </Button>
      </Upload>

      <Table
        columns={columns}
        dataSource={documents}
        rowKey="id"
        loading={loading}
        style={{ marginTop: 20 }}
      />

      {/* Modal lịch sử */}
      <Modal
        title={selectedDocument ? `Lịch sử - ${selectedDocument.documentName}` : ''}
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        width={1100}
        footer={null}
      >
        {selectedDocument && (
          <Table
            dataSource={selectedDocument.versions}
            rowKey="id"
            columns={[
              { title: 'Phiên bản', dataIndex: 'version', render: (v) => <Tag color="geekblue">{v}</Tag> },
              { title: 'Tên file', dataIndex: 'fileName' },
              { title: 'Kích thước', dataIndex: 'fileSize' },
              { title: 'Người tải', dataIndex: 'uploadedBy' },
              { title: 'Thời gian', dataIndex: 'uploadDate' },
              {
                title: 'Thao tác',
                render: (_, record) => (
                  <Space>
                    <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>Xem</Button>
                    <Button icon={<DownloadOutlined />} onClick={() => handleDownload(record)}>Tải xuống</Button>
                  </Space>
                )
              }
            ]}
            pagination={false}
          />
        )}
      </Modal>
    </div>
  );
};

export default DocumentManagement;






// // DocumentManagement.tsx
// import React, { useState } from 'react';
// import {
//   Table,
//   Button,
//   Space,
//   Modal,
//   Typography,
//   Upload,
//   message,
//   Tag,
//   Tooltip,
// } from 'antd';
// import {
//   DownloadOutlined,
//   EyeOutlined,
//   HistoryOutlined,
//   UploadOutlined,
//   DeleteOutlined,
// } from '@ant-design/icons';
// import type { UploadFile, UploadProps } from 'antd';
// import type { ColumnsType } from 'antd/es/table';
// import AppShell from '@/components/AppShell';

// const { Title, Text } = Typography;

// interface DocumentVersion {
//   id: string;
//   version: string;
//   fileName: string;
//   fileSize: string;
//   uploadedBy: string;
//   uploadDate: string;
//   url: string; // URL để xem/tải
// }

// interface Document {
//   id: string;
//   documentName: string;
//   currentVersion: string;
//   totalVersions: number;
//   lastUpdated: string;
//   versions: DocumentVersion[];
// }

// const DocumentManagement: React.FC = () => {
//   const [documents, setDocuments] = useState<Document[]>([
//     {
//       id: '1',
//       documentName: 'Hợp đồng mua bán tài sản.pdf',
//       currentVersion: 'v2.1',
//       totalVersions: 3,
//       lastUpdated: '2026-04-10 14:30',
//       versions: [
//         {
//           id: 'v1',
//           version: 'v1.0',
//           fileName: 'Hợp đồng mua bán tài sản.pdf',
//           fileSize: '2.4 MB',
//           uploadedBy: 'Nguyễn Văn A',
//           uploadDate: '2026-03-15 09:15',
//           url: '#',
//         },
//         {
//           id: 'v2',
//           version: 'v2.0',
//           fileName: 'Hợp đồng mua bán tài sản_v2.pdf',
//           fileSize: '2.5 MB',
//           uploadedBy: 'Nguyễn Văn A',
//           uploadDate: '2026-04-01 11:20',
//           url: '#',
//         },
//         {
//           id: 'v3',
//           version: 'v2.1',
//           fileName: 'Hợp đồng mua bán tài sản_v2.1.pdf',
//           fileSize: '2.6 MB',
//           uploadedBy: 'Trần Thị B',
//           uploadDate: '2026-04-10 14:30',
//           url: '#',
//         },
//       ],
//     },
//     {
//       id: '2',
//       documentName: 'Biên bản bàn giao thiết bị.docx',
//       currentVersion: 'v1.2',
//       totalVersions: 2,
//       lastUpdated: '2026-04-12 08:45',
//       versions: [
//         {
//           id: 'v4',
//           version: 'v1.0',
//           fileName: 'Biên bản bàn giao thiết bị.docx',
//           fileSize: '1.1 MB',
//           uploadedBy: 'Lê Văn C',
//           uploadDate: '2026-04-05 10:00',
//           url: '#',
//         },
//         {
//           id: 'v5',
//           version: 'v1.2',
//           fileName: 'Biên bản bàn giao thiết bị_v1.2.docx',
//           fileSize: '1.3 MB',
//           uploadedBy: 'Lê Văn C',
//           uploadDate: '2026-04-12 08:45',
//           url: '#',
//         },
//       ],
//     },
//   ]);

//   const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
//   const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   const handleView = (version: DocumentVersion) => {
//     window.open(version.url, '_blank');
//     message.info(`Đang mở: ${version.fileName}`);
//   };

//   const handleDownload = (version: DocumentVersion) => {
//     const link = document.createElement('a');
//     link.href = version.url;
//     link.download = version.fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     message.success(`Đang tải: ${version.fileName}`);
//   };

//   const showHistory = (doc: Document) => {
//     setSelectedDocument(doc);
//     setIsHistoryModalVisible(true);
//   };

//   const handleUpload: UploadProps['onChange'] = async (info) => {
//     const { file } = info;
//     setUploading(true);

//     // Simulate upload
//     setTimeout(() => {
//       message.success(`${file.name} đã được tải lên thành công (phiên bản mới)`);
//       setUploading(false);
      
//       // In real app, you would call API here to update document
//     }, 1500);
//   };

//   const columns: ColumnsType<Document> = [
//     {
//       title: 'Tên tài liệu',
//       dataIndex: 'documentName',
//       key: 'documentName',
//       render: (text) => <Text strong>{text}</Text>,
//     },
//     {
//       title: 'Phiên bản hiện tại',
//       dataIndex: 'currentVersion',
//       key: 'currentVersion',
//       render: (version) => <Tag color="blue">{version}</Tag>,
//     },
//     {
//       title: 'Số phiên bản',
//       dataIndex: 'totalVersions',
//       key: 'totalVersions',
//       render: (count) => <Text>{count} phiên bản</Text>,
//     },
//     {
//       title: 'Cập nhật lần cuối',
//       dataIndex: 'lastUpdated',
//       key: 'lastUpdated',
//     },
//     {
//       title: 'Thao tác',
//       key: 'action',
//       render: (_, record) => (
//         <Space size="middle">
//           <Tooltip title="Xem lịch sử phiên bản">
//             <Button
//               icon={<HistoryOutlined />}
//               onClick={() => showHistory(record)}
//             >
//               Lịch sử
//             </Button>
//           </Tooltip>
          
//           <Upload
//             showUploadList={false}
//             onChange={handleUpload}
//             beforeUpload={() => false}
//           >
//             <Tooltip title="Tải lên phiên bản mới">
//               <Button icon={<UploadOutlined />} type="primary" ghost>
//                 Phiên bản mới
//               </Button>
//             </Tooltip>
//           </Upload>
//         </Space>
//       ),
//     },
//   ];

//   const historyColumns: ColumnsType<DocumentVersion> = [
//     {
//       title: 'Phiên bản',
//       dataIndex: 'version',
//       key: 'version',
//       render: (v) => <Tag color="geekblue">{v}</Tag>,
//     },
//     {
//       title: 'Tên file',
//       dataIndex: 'fileName',
//       key: 'fileName',
//     },
//     {
//       title: 'Kích thước',
//       dataIndex: 'fileSize',
//       key: 'fileSize',
//     },
//     {
//       title: 'Người tải lên',
//       dataIndex: 'uploadedBy',
//       key: 'uploadedBy',
//     },
//     {
//       title: 'Thời gian',
//       dataIndex: 'uploadDate',
//       key: 'uploadDate',
//     },
//     {
//       title: 'Thao tác',
//       key: 'actions',
//       render: (_, record) => (
//         <Space>
//           <Button
//             icon={<EyeOutlined />}
//             onClick={() => handleView(record)}
//             type="link"
//           >
//             Xem
//           </Button>
//           <Button
//             icon={<DownloadOutlined />}
//             onClick={() => handleDownload(record)}
//             type="link"
//           >
//             Tải xuống
//           </Button>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <AppShell><div style={{ padding: 24 }}>
//       <Title level={3}>Quản lý tài liệu đính kèm</Title>
//       <Text type="secondary">
//         Xem và tải xuống tài liệu • Quản lý phiên bản tài liệu (lịch sử upload)
//       </Text>

//       <div style={{ marginTop: 24, marginBottom: 16 }}>
//         <Upload
//           showUploadList={false}
//           onChange={handleUpload}
//           beforeUpload={() => false}
//         >
//           <Button type="primary" icon={<UploadOutlined />} size="large">
//             Tải lên tài liệu mới
//           </Button>
//         </Upload>
//       </div>

//       <Table
//         columns={columns}
//         dataSource={documents}
//         rowKey="id"
//         pagination={{ pageSize: 10 }}
//       />

//       {/* Modal lịch sử phiên bản */}
//       <Modal
//         title={
//           selectedDocument 
//             ? `Lịch sử phiên bản - ${selectedDocument.documentName}` 
//             : 'Lịch sử phiên bản'
//         }
//         open={isHistoryModalVisible}
//         onCancel={() => setIsHistoryModalVisible(false)}
//         width={1000}
//         footer={null}
//       >
//         {selectedDocument && (
//           <Table
//             columns={historyColumns}
//             dataSource={selectedDocument.versions}
//             rowKey="id"
//             pagination={false}
//           />
//         )}
//       </Modal>
//     </div>
// </AppShell>
    
//   );
// };

// export default DocumentManagement;