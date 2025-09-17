import React, { useState } from "react";
import { IoMenuOutline } from "react-icons/io5";
import { MdNotificationsNone, MdSearch } from "react-icons/md";
import { useDashboardContext } from "../../context/DashboardContext";
import GlobalSearch from "../common/GlobalSearch";

function Navbar() {
  const { toggleSidebar } = useDashboardContext();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          className="navbar-btn"
          onClick={toggleSidebar}
        >
          <IoMenuOutline size={20} />
        </button>
        <h1 className="navbar-title">Dashboard</h1>
      </div>

      <div className="navbar-right">
        {/* Global Search */}
        <button 
          className="navbar-btn"
          onClick={() => setShowSearch(true)}
        >
          <MdSearch size={20} />
        </button>

        {/* Notifications */}
        <button className="navbar-btn">
          <MdNotificationsNone size={20} />
        </button>

        {/* Profile Dropdown */}
        <div className="dropdown">
          <button 
            className="navbar-btn dropdown-toggle" 
            type="button" 
            data-bs-toggle="dropdown"
          >
            <img 
              src="https://via.placeholder.com/32x32" 
              alt="Profile" 
              className="rounded-circle"
              width="32"
              height="32"
            />
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><a className="dropdown-item" href="#profile">Profile</a></li>
            <li><a className="dropdown-item" href="#settings">Settings</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <a 
                className="dropdown-item" 
                href="#logout"
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  window.location.href = '/auth';
                }}
              >
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />
    </nav>
  );
}

export default Navbar;
