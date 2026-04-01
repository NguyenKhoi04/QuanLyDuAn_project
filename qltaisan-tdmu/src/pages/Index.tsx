import AppHeader from "@/components/Header";
import AppSidebar from "@/components/Sidebar";

const Index = () => {
  return (
    // h-screen: Cố định toàn bộ container bằng chiều cao màn hình
    // overflow-hidden: Ngăn toàn bộ trang web bị cuộn dướt
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      
      {/* Header sẽ nằm cố định ở trên cùng do container cha không cuộn */}
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar cố định chiều dọc */}
        <AppSidebar />

        {/* Nội dung chính: flex-1 để chiếm hết chỗ trống còn lại 
            overflow-y-auto: Chỉ cho phép vùng này cuộn khi nội dung dài */}
        <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-background">
          <h2 className="text-3xl font-semibold text-welcome-text">
            Chào mừng bạn đến với Hệ thống Quản lý Tài sản
          </h2>
          {/* Thêm nội dung dài ở đây để kiểm tra thanh cuộn */}
        </main>
      </div>
    </div>
  );
};

export default Index;