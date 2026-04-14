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
        <Button variant="outline" size="icon" className="relative border-black dark:border-white">
          <Bell className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-600 border border-white" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        // Thay đổi quan trọng ở đây: border-black và bg-white (light mode) / border-white và bg-black (dark mode)
        className="w-80 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
      >
        <DropdownMenuLabel className="font-bold uppercase tracking-tight">Thông báo</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-black dark:bg-white h-[2px]" />
        
        <div className="max-h-[300px] overflow-y-auto">
          {items.map((x) => (
            <DropdownMenuItem 
              key={x.id} 
              className="flex flex-col items-start focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer p-3"
            >
              <span className="font-bold">{x.title}</span>
              {x.desc && (
                <span className="text-xs opacity-80">{x.desc}</span>
              )}
            </DropdownMenuItem>
          ))}
        </div>

        {items.length === 0 && (
          <DropdownMenuItem disabled className="text-center justify-center py-4">
            Không có thông báo
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
