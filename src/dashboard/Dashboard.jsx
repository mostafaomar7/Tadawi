import React, { useEffect } from "react";
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
import ActiveIngredients from "./pages/ActiveIngredients/ActiveIngredients";
import TherapeuticClasses from "./pages/TherapeuticClasses/TherapeuticClasses";
import Reviews from "./pages/Reviews/Reviews";

// Dashboard Layout Component
function DashboardLayout({ children }) {
  useEffect(() => {
    const bootstrapLink = document.createElement("link");
    bootstrapLink.rel = "stylesheet";
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
    document.head.appendChild(bootstrapLink);

    return () => {
      bootstrapLink.remove(); // ينظف عند الخروج من الداشبورد
    };
  }, []);


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
            <Route path="/active-ingredients" element={<ActiveIngredients />} />
            <Route path="/therapeutic-classes" element={<TherapeuticClasses />} />
            <Route path="/reviews" element={<Reviews />} />
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
