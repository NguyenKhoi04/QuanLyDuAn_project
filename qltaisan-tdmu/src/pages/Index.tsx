import AppHeader from "@/components/Header";
import AppSidebar from "@/components/Sidebar";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center bg-background">
          <h2 className="text-3xl font-semibold text-welcome-text">
            Chào mừng bạn đến với Hệ thống Quản lý Tài sản
          </h2>
        </main>
      </div>
    </div>
  );
};

export default Index;
