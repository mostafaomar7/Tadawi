import React from "react";
import { Routes, Route } from "react-router-dom";
import { DashboardProvider, useDashboardContext } from "./context/DashboardContext";
import { ToastProvider, useToast } from "./hooks/useToast";
import Sidebar from "./components/sidebar/Sidebar";
import Navbar from "./components/navbar/Navbar";
import ToastContainer from "./components/common/ToastContainer";
import Dashboard from "./pages/Dashboard/Dashboard";
import Medicines from "./pages/Medicines/Medicines";
import Orders from "./pages/Orders/Orders";
import Users from "./pages/Users/Users";
import Prescriptions from "./pages/Prescriptions/Prescriptions";
import Donations from "./pages/Donations/Donations";
import Settings from "./pages/Settings/Settings";
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/dashboard.css';

// Dashboard Layout Component
function DashboardLayout({ children }) {
  const { sidebarCollapsed } = useDashboardContext();
  const { toasts, removeToast } = useToast();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/users" element={<Users />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

// Main Dashboard Component
function MainDashboard() {
  return (
    <DashboardProvider>
      <ToastProvider>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </ToastProvider>
    </DashboardProvider>
  );
}

export default MainDashboard;
