"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";// Sử dụng để chuyển hướng
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, AlertTriangle, Info, Clock, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { message } from "antd";
import { notificationService } from "@/lib/notificationHelper";

type Notification = {
  mathongbao: number;
  manguoidung: number;
  mataisan?: number;
  noidung: string;
  ngaygui: string;
  isread: boolean;
  loaithongbao: string;
};

const NotificationSystem: React.FC<{ manguoidung: number }> = ({
  manguoidung,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (manguoidung) {
      fetchNotifications();

      // Đăng ký Real-time: Lắng nghe mọi thay đổi (INSERT, UPDATE)
      const channel = supabase
        .channel("thongbao-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "thongbao",
            filter: `manguoidung=eq.${manguoidung}`,
          },
          (payload) => {
            console.log("Change received!", payload);
            fetchNotifications(); // Tải lại danh sách khi có thông báo mới
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [manguoidung]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("thongbao")
      .select("*")
      .eq("manguoidung", manguoidung)
      .order("ngaygui", { ascending: false })
      .limit(5); // Chỉ lấy 5 thông báo mới nhất để hiển thị ở dropdown

    if (error) {
      console.error("Lỗi:", error.message);
    } else {
      setNotifications(data || []);
      const unread = (data || []).filter((n) => !n.isread).length;
      setUnreadCount(unread);
    }
  };

  const handleNotificationClick = async (noti: Notification) => {
    // 1. Đánh dấu đã đọc trong Database
    if (!noti.isread) {
      await supabase
        .from("thongbao")
        .update({ isread: true })
        .eq("mathongbao", noti.mathongbao);
    }

    // 2. Đóng dropdown
    setOpen(false);

    // 3. Chuyển hướng đến trang chi tiết thông báo
    // Bạn có thể truyền ID vào query để trang /notifications tự động mở thông báo đó
    window.location.href = `/notifications?mathongbao=${noti.mathongbao}`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "incident":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "status":
        return <Info className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative border-none bg-transparent hover:bg-white/10">
          <Bell className="h-6 w-6 text-white" />
          
          {/* SỐ THÔNG BÁO MÀU CAM */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-[11px] flex items-center justify-center text-white font-bold border-2 border-slate-900 shadow-lg animate-in zoom-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 bg-white dark:bg-slate-900 border shadow-2xl rounded-xl p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800">
          <span className="font-bold text-sm text-slate-800 dark:text-white">Thông báo mới nhất</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 uppercase">
              {unreadCount} mới
            </span>
          )}
        </div>
        
        <DropdownMenuSeparator className="m-0" />

        <div className="max-h-[350px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm italic">
              Không có thông báo nào gần đây
            </div>
          ) : (
            notifications.map((noti) => (
              <DropdownMenuItem
                key={noti.mathongbao}
                className={`flex flex-col items-start p-4 cursor-pointer border-b last:border-none focus:bg-slate-50 dark:focus:bg-slate-800 ${
                  !noti.isread ? "bg-orange-50/30 dark:bg-orange-900/5" : ""
                }`}
                onClick={() => handleNotificationClick(noti)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-1">{getIcon(noti.loaithongbao)}</div>
                  <div className="flex-1">
                    <p className={`text-sm leading-snug ${!noti.isread ? "font-bold text-slate-900 dark:text-white" : "font-normal text-slate-500"}`}>
                      {noti.noidung}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(noti.ngaygui).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  {!noti.isread && (
                    <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 shrink-0 shadow-sm" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        
        <button 
          onClick={() => { router.push('/notifications'); setOpen(false); }}
          className="w-full py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          Xem tất cả thông báo
          <ExternalLink className="h-3 w-3" />
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationSystem;