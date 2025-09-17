import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dropdownRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const user = localStorage.getItem("authUser")
    ? JSON.parse(localStorage.getItem("authUser"))
    : null;

  const handleLogout = () => {
    console.log("🔴 Logout clicked");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("authRole");
    navigate("/auth");
  };

  // ✅ يقفل المنيو لو دوست براها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log("🟡 Click outside -> closing menu");
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Tadawi Logo" className="h-8 w-10" />
          <Link to="/" className="text-xl font-bold text-blue-600 no-underline">
            Tadawi
          </Link>
        </div>

        {/* Hamburger button (mobile) */}
        <button
          className="lg:hidden text-gray-700 text-2xl"
          onClick={() => {
            console.log("📱 Toggle mobile menu ->", !isOpen);
            setIsOpen(!isOpen);
          }}
        >
          ☰
        </button>

        {/* Links */}
        <div
          className={`
            ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
             transition-all duration-300
            lg:flex lg:opacity-100 lg:max-h-none
            flex-col lg:flex-row lg:items-center gap-4
            absolute lg:static top-14 left-0 w-full lg:w-auto
            bg-white lg:bg-transparent px-4 lg:p-0
          `}
        >
          <Link
            to="/donate"
            className="block text-blue-600 hover:text-blue-800 no-underline"
          >
            Donate
          </Link>
          <Link
            to="/pharmacies"
            className="block text-blue-600 hover:text-blue-800 no-underline"
          >
            Pharmacies
          </Link>
          <Link
            to="/upload-prescription"
            className="block text-blue-600 hover:text-blue-800 no-underline"
          >
            Upload Prescription
          </Link>

          {!token ? (
            <Link
              to="/auth"
              className="block bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-sm no-underline"
            >
              Login
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Icon */}
              <button
                onClick={() => {
                  console.log("👤 Profile icon clicked ->", !profileOpen);
                  setProfileOpen(!profileOpen);
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-transparent hover:bg-transparent active:bg-transparent focus:outline-none border-0"
              >
                <User className="w-7 h-7" />
              </button>
              {/* Dropdown */}
              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-gray-200 z-50 overflow-hidden">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors no-underline"
                    onClick={() => setProfileOpen(false)}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-0 focus:outline-none"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
