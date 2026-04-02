import AppHeader from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  /** Class bổ sung cho vùng nội dung (mặc định có padding trang) */
  mainClassName?: string;
};

/**
 * Layout cố định: header + sidebar không cuộn theo trang, chỉ khối main cuộn.
 */
export default function AppShell({ children, mainClassName }: AppShellProps) {
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <AppHeader />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AppSidebar />
        <main
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
            mainClassName ?? "p-6",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
