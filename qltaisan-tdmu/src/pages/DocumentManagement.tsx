// DocumentManagement.tsx
import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Typography,
  Upload,
  message,
  Tag,
  Tooltip,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface DocumentVersion {
  id: string;
  version: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  url: string; // URL để xem/tải
}

interface Document {
  id: string;
  documentName: string;
  currentVersion: string;
  totalVersions: number;
  lastUpdated: string;
  versions: DocumentVersion[];
}

const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      documentName: 'Hợp đồng mua bán tài sản.pdf',
      currentVersion: 'v2.1',
      totalVersions: 3,
      lastUpdated: '2026-04-10 14:30',
      versions: [
        {
          id: 'v1',
          version: 'v1.0',
          fileName: 'Hợp đồng mua bán tài sản.pdf',
          fileSize: '2.4 MB',
          uploadedBy: 'Nguyễn Văn A',
          uploadDate: '2026-03-15 09:15',
          url: '#',
        },
        {
          id: 'v2',
          version: 'v2.0',
          fileName: 'Hợp đồng mua bán tài sản_v2.pdf',
          fileSize: '2.5 MB',
          uploadedBy: 'Nguyễn Văn A',
          uploadDate: '2026-04-01 11:20',
          url: '#',
        },
        {
          id: 'v3',
          version: 'v2.1',
          fileName: 'Hợp đồng mua bán tài sản_v2.1.pdf',
          fileSize: '2.6 MB',
          uploadedBy: 'Trần Thị B',
          uploadDate: '2026-04-10 14:30',
          url: '#',
        },
      ],
    },
    {
      id: '2',
      documentName: 'Biên bản bàn giao thiết bị.docx',
      currentVersion: 'v1.2',
      totalVersions: 2,
      lastUpdated: '2026-04-12 08:45',
      versions: [
        {
          id: 'v4',
          version: 'v1.0',
          fileName: 'Biên bản bàn giao thiết bị.docx',
          fileSize: '1.1 MB',
          uploadedBy: 'Lê Văn C',
          uploadDate: '2026-04-05 10:00',
          url: '#',
        },
        {
          id: 'v5',
          version: 'v1.2',
          fileName: 'Biên bản bàn giao thiết bị_v1.2.docx',
          fileSize: '1.3 MB',
          uploadedBy: 'Lê Văn C',
          uploadDate: '2026-04-12 08:45',
          url: '#',
        },
      ],
    },
  ]);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleView = (version: DocumentVersion) => {
    window.open(version.url, '_blank');
    message.info(`Đang mở: ${version.fileName}`);
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

  const handleUpload: UploadProps['onChange'] = async (info) => {
    const { file } = info;
    setUploading(true);

    // Simulate upload
    setTimeout(() => {
      message.success(`${file.name} đã được tải lên thành công (phiên bản mới)`);
      setUploading(false);
      
      // In real app, you would call API here to update document
    }, 1500);
  };

  const columns: ColumnsType<Document> = [
    {
      title: 'Tên tài liệu',
      dataIndex: 'documentName',
      key: 'documentName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Phiên bản hiện tại',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
      render: (version) => <Tag color="blue">{version}</Tag>,
    },
    {
      title: 'Số phiên bản',
      dataIndex: 'totalVersions',
      key: 'totalVersions',
      render: (count) => <Text>{count} phiên bản</Text>,
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem lịch sử phiên bản">
            <Button
              icon={<HistoryOutlined />}
              onClick={() => showHistory(record)}
            >
              Lịch sử
            </Button>
          </Tooltip>
          
          <Upload
            showUploadList={false}
            onChange={handleUpload}
            beforeUpload={() => false}
          >
            <Tooltip title="Tải lên phiên bản mới">
              <Button icon={<UploadOutlined />} type="primary" ghost>
                Phiên bản mới
              </Button>
            </Tooltip>
          </Upload>
        </Space>
      ),
    },
  ];

  const historyColumns: ColumnsType<DocumentVersion> = [
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version',
      render: (v) => <Tag color="geekblue">{v}</Tag>,
    },
    {
      title: 'Tên file',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Kích thước',
      dataIndex: 'fileSize',
      key: 'fileSize',
    },
    {
      title: 'Người tải lên',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
    },
    {
      title: 'Thời gian',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            type="link"
          >
            Xem
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
            type="link"
          >
            Tải xuống
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Quản lý tài liệu đính kèm</Title>
      <Text type="secondary">
        Xem và tải xuống tài liệu • Quản lý phiên bản tài liệu (lịch sử upload)
      </Text>

      <div style={{ marginTop: 24, marginBottom: 16 }}>
        <Upload
          showUploadList={false}
          onChange={handleUpload}
          beforeUpload={() => false}
        >
          <Button type="primary" icon={<UploadOutlined />} size="large">
            Tải lên tài liệu mới
          </Button>
        </Upload>
      </div>

      <Table
        columns={columns}
        dataSource={documents}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal lịch sử phiên bản */}
      <Modal
        title={
          selectedDocument 
            ? `Lịch sử phiên bản - ${selectedDocument.documentName}` 
            : 'Lịch sử phiên bản'
        }
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        width={1000}
        footer={null}
      >
        {selectedDocument && (
          <Table
            columns={historyColumns}
            dataSource={selectedDocument.versions}
            rowKey="id"
            pagination={false}
          />
        )}
      </Modal>
    </div>
  );
};

export default DocumentManagement;