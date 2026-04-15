'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CheckCircle, AlertTriangle, Info, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { message } from 'antd'; // hoặc dùng toast của bạn
import { notificationService } from '@/lib/notificationHelper';

type Notification = {
  mathongbao: number;
  manguoidung: number;
  mataisan?: number;
  noidung: string;
  ngaygui: string;
  isread: boolean;
  loaithongbao: string;
};

const NotificationSystem: React.FC<{ manguoidung: number }> = ({ manguoidung }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [manguoidung]);

  // Lấy danh sách thông báo
  const fetchNotifications = async () => {
    if (!manguoidung) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('thongbao')
      .select('*')
      .eq('manguoidung', manguoidung)
      .order('ngaygui', { ascending: false })
      .limit(20);

    if (error) {
      message.error('Lỗi tải thông báo: ' + error.message);
    } else {
      setNotifications(data || []);
      const unread = (data || []).filter(n => !n.isread).length;
      setUnreadCount(unread);
    }
    setLoading(false);
  };

  //Khi tạo lịch bảo trì mới, gửi thông báo
  const handleCreateMaintenance = async (maNguoiDung: number, mataisan: number, tentaisan: string, ngaybaotri: string) => {
    const success = await notificationService.sendMaintenanceReminder(maNguoiDung, mataisan, tentaisan, ngaybaotri);
    if (success) {
      message.success('Đã gửi thông báo nhắc nhở bảo trì');
    } else {
      message.error('Gửi thông báo thất bại');
    }
  }

  // ==================== THÊM ĐOẠN NÀY ====================

const testSendNotification = async () => {
  const result = await notificationService.sendIncidentAlert(
    1,                                 // MaNguoiDung (Admin)
    1,                                 // MaTaiSan (có thể thay số khác)
    "Máy chiếu phòng A301",            // Tên tài sản
    "Không bật được, đèn báo lỗi đỏ",  // Mô tả sự cố
    "admin@tdmu.edu.vn"                // ← THAY BẰNG EMAIL CỦA BẠN
  );

  if (result) {
    message.success("✅ Gửi thành công! Kiểm tra email của bạn.");
  } else {
    message.error("❌ Gửi thất bại. Xem console để xem lỗi.");
  }
};
// =====================================================

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('thongbao-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'thongbao',
          filter: `manguoidung=eq.${manguoidung}` 
        }, 
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [manguoidung]);

  // Đánh dấu đã đọc
  const markAsRead = async (mathongbao: number) => {
    await supabase
      .from('thongbao')
      .update({ isread: true })
      .eq('mathongbao', mathongbao);
    
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await supabase
      .from('thongbao')
      .update({ isread: true })
      .eq('manguoidung', manguoidung)
      .eq('isread', false);
    
    fetchNotifications();
    message.success('Đã đánh dấu tất cả là đã đọc');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'incident': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'status': return <Info className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 bg-white dark:bg-slate-900 border shadow-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="text-lg font-semibold">Thông báo</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Không có thông báo nào
            </div>
          ) : (
            notifications.map((noti) => (
              <DropdownMenuItem
                key={noti.mathongbao}
                className="flex flex-col items-start p-4 hover:bg-accent cursor-pointer"
                onClick={() => markAsRead(noti.mathongbao)}
              >
                <div className="flex items-start gap-3 w-full">
                  {getIcon(noti.loaithongbao)}
                  <div className="flex-1">
                    <p className={`font-medium ${!noti.isread ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {noti.noidung}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(noti.ngaygui).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {!noti.isread && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator />
        <div className="p-2 text-center text-xs text-muted-foreground">
          Tích hợp thông báo bảo trì • Sự cố • Trạng thái tài sản
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationSystem;


// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Bell } from "lucide-react";
// import { useMemo } from "react";

// type NotificationItem = {
//   id: string;
//   title: string;
//   desc?: string;
// };

// function NotificationSystem() {
//   const items = useMemo<NotificationItem[]>(
//     () => [
//       {
//         id: "n1",
//         title: "Sự cố mới: TS #101",
//         desc: "Rò rỉ (mức độ: Khẩn cấp)",
//       },
//       {
//         id: "n2",
//         title: "Kế hoạch sắp tới",
//         desc: "Có kế hoạch bảo trì trong tuần này",
//       },
//     ],
//     [],
//   );

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="outline" size="icon" className="relative">
//           <Bell className="h-4 w-4" />
//           {items.length > 0 && (
//             <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
//           )}
//         </Button>
//       </DropdownMenuTrigger>
      
//       {/* Cập nhật className ở đây */}
//       <DropdownMenuContent 
//         align="end" 
//         className="w-80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 shadow-xl"
//       >
//         <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
//         <DropdownMenuSeparator />
        
//         <div className="max-h-[300px] overflow-y-auto"> {/* Thêm scroll nếu quá nhiều thông báo */}
//           {items.map((x) => (
//             <DropdownMenuItem key={x.id} className="flex flex-col items-start focus:bg-white/20">
//               <span className="font-medium">{x.title}</span>
//               {x.desc && (
//                 <span className="text-xs text-muted-foreground">{x.desc}</span>
//               )}
//             </DropdownMenuItem>
//           ))}
//         </div>

//         {items.length === 0 && (
//           <DropdownMenuItem disabled>Không có thông báo</DropdownMenuItem>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// export default NotificationSystem;
