import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useDashboardContext } from "../../context/DashboardContext";
import { 
  MdDashboard, 
  MdMedication, 
  MdShoppingCart, 
  MdPeople, 
  MdReceipt, 
  MdVolunteerActivism,
  MdScience,
  MdCategory,
  MdRateReview,
  MdSettings
} from "react-icons/md";

// Dashboard routes
const routes = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: MdDashboard,
  },
  {
    name: "Medicines",
    path: "/dashboard/medicines",
    icon: MdMedication,
  },
  {
    name: "Orders",
    path: "/dashboard/orders",
    icon: MdShoppingCart,
  },
  {
    name: "Users",
    path: "/dashboard/users",
    icon: MdPeople,
  },
  {
    name: "Prescriptions",
    path: "/dashboard/prescriptions",
    icon: MdReceipt,
  },
  {
    name: "Donations",
    path: "/dashboard/donations",
    icon: MdVolunteerActivism,
  },
  {
    name: "Active Ingredients",
    path: "/dashboard/active-ingredients",
    icon: MdScience,
  },
  {
    name: "Therapeutic Classes",
    path: "/dashboard/therapeutic-classes",
    icon: MdCategory,
  },
  {
    name: "Reviews",
    path: "/dashboard/reviews",
    icon: MdRateReview,
  },
  {
    name: "Settings",
    path: "/dashboard/settings",
    icon: MdSettings,
  },
];

function Sidebar() {
  const { sidebarCollapsed } = useDashboardContext();
  const location = useLocation();

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">T</div>
        <h3 className="sidebar-title">Tadawi Dashboard</h3>
      </div>
      
      <nav className="sidebar-nav">
        {routes.map((route, index) => {
          const isActive = location.pathname === route.path;
          const IconComponent = route.icon;
          
          return (
            <div key={index} className="nav-item">
              <Link 
                to={route.path} 
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <div className="nav-icon">
                  <IconComponent size={20} />
                </div>
                <span className="nav-text">{route.name}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
