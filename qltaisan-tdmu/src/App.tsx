import "./App.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Decentralization/Login";
import AIChat from "./pages/AIChat";
import AssetList from "./pages/AssetList";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ThongKe from "./pages/ThongKe";
import Users from "./pages/Users";
import Setting from "./pages/Setting";
import PeriodicMaintenancePlanning from "./pages/PeriodicMaintenancePlanning";
import AssetIncidentRecording from "./pages/AssetIncidentRecording";
import RepairAssignmentRecording from "./pages/RepairAssignmentRecording";
import MaintenanceHistory from "./pages/MaintenanceHistory";
import MaintenanceDashboard from "./pages/MaintenanceDashboard";
import FloatingAIChat from "@/components/FloatingAIChat";
import KiemKe from "./pages/KiemKe";
import AssetLocationTracking from "./pages/AssetLocationTracking";
import AssetTransferManagement from "./pages/AssetTransferManagement";
import PositionDepartment from "./pages/position_department";
import DocumentManagement from "./pages/DocumentManagement";
import AssetClassification from "./pages/AssetClassification";
import SupplierManagement from "./pages/SupplierManagement";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <FloatingAIChat />
          <Routes>
            <Route path="/" element={<Index />} />
             <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<AssetList />} />
            /// Các route khác trong header
            <Route path="/quản-lý-tài-liệu" element={<DocumentManagement />} />
            <Route
              path="/ke-hoach-bao-tri-dinh-ky"
              element={<PeriodicMaintenancePlanning />}
            />
            <Route path="/su-co-tai-san" element={<AssetIncidentRecording />} />
            <Route
              path="/phan-cong-sua-chua"
              element={<RepairAssignmentRecording />}
            />
            <Route path="/lich-su-bao-tri" element={<MaintenanceHistory />} />
            <Route path="/bao-tri" element={<MaintenanceDashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/thongke" element={<ThongKe />} />
            <Route path="/kiem-ke" element={<KiemKe />} />
            <Route path="/dieu-chuyen-tai-san" element={<AssetTransferManagement />} />
            <Route path="/lich-su-bao-tri" element={<MaintenanceHistory />} />
            <Route path="/vi-tri-tai-san" element={<AssetLocationTracking />} />
              <Route path="/vi-tri-phong-ban" element={<PositionDepartment />} />
              <Route path="/dieu-chuyen-tai-san" element={<AssetTransferManagement />} />
              <Route path="/phan-loai-tai-san" element={<AssetClassification/>} />
              <Route path="/nha-cung-cap" element={<SupplierManagement />} />
              {/* <Route path="/su-dung-bao-tri" element={<MaintenanceUsage />} /> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
