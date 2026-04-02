import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useMemo } from "react";

type NotificationItem = {
  id: string;
  title: string;
  desc?: string;
};

function NotificationSystem() {
  const items = useMemo<NotificationItem[]>(
    () => [
      {
        id: "n1",
        title: "Sự cố mới: TS #101",
        desc: "Rò rỉ (mức độ: Khẩn cấp)",
      },
      {
        id: "n2",
        title: "Kế hoạch sắp tới",
        desc: "Có kế hoạch bảo trì trong tuần này",
      },
    ],
    [],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((x) => (
          <DropdownMenuItem key={x.id} className="flex flex-col items-start">
            <span className="font-medium">{x.title}</span>
            {x.desc && (
              <span className="text-xs text-muted-foreground">{x.desc}</span>
            )}
          </DropdownMenuItem>
        ))}
        {items.length === 0 && (
          <DropdownMenuItem disabled>Không có thông báo</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationSystem;
