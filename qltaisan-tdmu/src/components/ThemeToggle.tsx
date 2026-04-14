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
    []
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative border-2 border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <Bell className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-600 border-2 border-white dark:border-black" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 
          bg-white dark:bg-black 
          border-2 border-black dark:border-white 
          rounded-none 
          shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] 
          dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
      >
        <DropdownMenuLabel className="font-bold uppercase tracking-tight px-4 py-3">
          Thông báo
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-black/80 dark:bg-white/80 h-[3px]" />

        <div className="max-h-[320px] overflow-y-auto">
          {items.map((x) => (
            <DropdownMenuItem
              key={x.id}
              className="flex flex-col items-start focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer p-4 border-b border-black/10 dark:border-white/10 last:border-0"
            >
              <span className="font-bold">{x.title}</span>
              {x.desc && (
                <span className="text-xs opacity-75 mt-1">{x.desc}</span>
              )}
            </DropdownMenuItem>
          ))}
        </div>

        {items.length === 0 && (
          <DropdownMenuItem disabled className="text-center justify-center py-8">
            Không có thông báo
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationSystem;

// 'use client';

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Monitor, Moon, Sun } from "lucide-react";

// type Theme = 'light' | 'dark' | 'system';

// const ThemeToggle = () => {
//   const [theme, setTheme] = useState<Theme>("system");
//   const [mounted, setMounted] = useState(false);
//   const [open, setOpen] = useState(false);
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     setMounted(true);
//     const savedTheme = localStorage.getItem("theme") as Theme | null;
//     if (savedTheme) {
//       setTheme(savedTheme);
//       applyTheme(savedTheme);
//     } else {
//       applyTheme('system');
//     }
//   }, []);

//   const getSystemIsDark = () =>
//     window.matchMedia("(prefers-color-scheme: dark)").matches;

//   const applyTheme = (newTheme: Theme) => {
//     const root = document.documentElement;
//     root.classList.remove("dark");

//     if (newTheme === "system") {
//       const isDark = getSystemIsDark();
//       root.classList.toggle("dark", isDark);
//       // Bạn có thể lưu hoặc không lưu tùy ý, thường system thì không lưu để linh hoạt
//       return;
//     }

//     root.classList.toggle("dark", newTheme === "dark");
//     localStorage.setItem("theme", newTheme);
//   };

//   const changeTheme = (newTheme: Theme) => {
//     setTheme(newTheme);
//     applyTheme(newTheme);
//     setOpen(false);
//   };

//   useEffect(() => {
//     if (!mounted || theme !== "system") return;
//     const mql = window.matchMedia("(prefers-color-scheme: dark)");
//     const onChange = () => applyTheme("system");
//     mql.addEventListener("change", onChange);
//     return () => mql.removeEventListener("change", onChange);
//   }, [mounted, theme]);

//   useEffect(() => {
//     if (!open) return;
//     const handleClickOutside = (e: MouseEvent) => {
//       if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     window.addEventListener("mousedown", handleClickOutside);
//     return () => window.removeEventListener("mousedown", handleClickOutside);
//   }, [open]);

//   const items = useMemo(() => [
//     { key: "light" as const, label: "Giao diện Sáng", icon: Sun },
//     { key: "dark" as const, label: "Giao diện Tối", icon: Moon },
//     { key: "system" as const, label: "Theo hệ thống", icon: Monitor },
//   ], []);

//   const ActiveIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

//   if (!mounted) return <div className="p-3 w-11 h-11" />; 

//   return (
//     <div ref={containerRef} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         /* SỬA LẠI CLASS: Cho phép hiển thị tốt trên cả nền sáng/tối */
//         className="p-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-2xl transition flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
//       >
//         <ActiveIcon className="w-5 h-5" />
//       </button>

//       {open && (
//         <div
//           className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-3xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200"
//         >
//           {items.map((x) => {
//             const Icon = x.icon;
//             const active = theme === x.key;
//             return (
//               <button
//                 key={x.key}
//                 type="button"
//                 onClick={() => changeTheme(x.key)}
//                 /* SỬA LẠI CLASS: Màu text và hover linh hoạt */
//                 className={`w-full px-5 py-3 flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors ${
//                   active 
//                     ? "text-blue-600 dark:text-white font-medium" 
//                     : "text-zinc-600 dark:text-zinc-400"
//                 }`}
//               >
//                 <Icon className={`w-5 h-5 ${active ? "text-blue-600 dark:text-white" : ""}`} />
//                 <span className="flex-1">{x.label}</span>
//                 {active && (
//                   <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-white" />
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ThemeToggle;



// // 'use client';

// // import React, { useEffect, useMemo, useRef, useState } from "react";
// // import { Monitor, Moon, Sun } from "lucide-react";

// // type Theme = 'light' | 'dark' | 'system';

// // const ThemeToggle = () => {
// //   const [theme, setTheme] = useState<Theme>("system");
// //   const [mounted, setMounted] = useState(false);
// //   const [open, setOpen] = useState(false);
// //   const containerRef = useRef<HTMLDivElement | null>(null);

// //   // Tránh hydration mismatch (quan trọng khi dùng SSR)
// //   useEffect(() => {
// //     setMounted(true);
// //     const savedTheme = localStorage.getItem("theme") as Theme | null;
// //     if (savedTheme) {
// //       setTheme(savedTheme);
// //       applyTheme(savedTheme);
// //     } else {
// //       applyTheme('system');
// //     }
// //   }, []);

// //   const getSystemIsDark = () =>
// //     window.matchMedia("(prefers-color-scheme: dark)").matches;

// //   const applyTheme = (newTheme: Theme) => {
// //     const root = document.documentElement;
// //     root.classList.remove("dark");

// //     if (newTheme === "system") {
// //       root.classList.toggle("dark", getSystemIsDark());
// //       localStorage.removeItem("theme"); // Theo hệ thống
// //       return;
// //     }

// //     root.classList.toggle("dark", newTheme === "dark");
// //     localStorage.setItem("theme", newTheme);
// //   };

// //   const changeTheme = (newTheme: Theme) => {
// //     setTheme(newTheme);
// //     applyTheme(newTheme);
// //     setOpen(false);
// //   };

// //   // Khi chọn "system", tự cập nhật nếu Windows đổi sáng/tối
// //   useEffect(() => {
// //     if (!mounted) return;
// //     if (theme !== "system") return;

// //     const mql = window.matchMedia("(prefers-color-scheme: dark)");
// //     const onChange = () => applyTheme("system");

// //     if ("addEventListener" in mql) {
// //       mql.addEventListener("change", onChange);
// //       return () => mql.removeEventListener("change", onChange);
// //     }

// //     // Fallback Safari cũ
// //     // eslint-disable-next-line deprecation/deprecation
// //     mql.addListener(onChange);
// //     // eslint-disable-next-line deprecation/deprecation
// //     return () => mql.removeListener(onChange);
// //   }, [mounted, theme]);

// //   // Click ra ngoài / ESC để đóng dropdown (đỡ phải giữ chuột hover)
// //   useEffect(() => {
// //     if (!open) return;

// //     const onPointerDown = (e: PointerEvent) => {
// //       const el = containerRef.current;
// //       if (!el) return;
// //       if (e.target instanceof Node && el.contains(e.target)) return;
// //       setOpen(false);
// //     };

// //     const onKeyDown = (e: KeyboardEvent) => {
// //       if (e.key === "Escape") setOpen(false);
// //     };

// //     window.addEventListener("pointerdown", onPointerDown);
// //     window.addEventListener("keydown", onKeyDown);
// //     return () => {
// //       window.removeEventListener("pointerdown", onPointerDown);
// //       window.removeEventListener("keydown", onKeyDown);
// //     };
// //   }, [open]);

// //   const items = useMemo(
// //     () =>
// //       [
// //         { key: "light" as const, label: "Giao diện Sáng", icon: Sun },
// //         { key: "dark" as const, label: "Giao diện Tối", icon: Moon },
// //         { key: "system" as const, label: "Theo hệ thống", icon: Monitor },
// //       ] as const,
// //     [],
// //   );

// //   const ActiveIcon =
// //     theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

// //   if (!mounted) return null; // Tránh flash khi load

// //   return (
// //     <div ref={containerRef} className="relative">
// //       <button
// //         type="button"
// //         aria-label="Đổi giao diện"
// //         aria-haspopup="menu"
// //         aria-expanded={open}
// //         aria-pressed={theme !== "system"}
// //         onClick={() => setOpen((v) => !v)}
// //         className="p-3 hover:bg-zinc-800 rounded-2xl transition flex items-center gap-2 text-zinc-300 hover:text-white select-none"
// //       >
// //         <ActiveIcon className="w-5 h-5" />
// //       </button>

// //       {/* Dropdown menu */}
// //       {open && (
// //         <div
// //           role="menu"
// //           className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl py-2 z-50"
// //         >
// //           {items.map((x) => {
// //             const Icon = x.icon;
// //             const active = theme === x.key;
// //             return (
// //               <button
// //                 key={x.key}
// //                 type="button"
// //                 role="menuitemradio"
// //                 aria-checked={active}
// //                 onClick={() => changeTheme(x.key)}
// //                 className={`w-full px-5 py-3 flex items-center gap-3 hover:bg-zinc-800 text-left ${
// //                   active ? "text-white" : "text-zinc-400"
// //                 }`}
// //               >
// //                 <Icon className="w-5 h-5" />
// //                 <span className="flex-1">{x.label}</span>
// //                 {active && (
// //                   <span className="text-xs text-zinc-500">Đang chọn</span>
// //                 )}
// //               </button>
// //             );
// //           })}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ThemeToggle;