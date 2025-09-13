// src/components/Home/Header/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const user = localStorage.getItem("authUser")
    ? JSON.parse(localStorage.getItem("authUser"))
    : null;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/auth");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand text-primary fw-bold" to="/">
          Tadawi
        </Link>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/donate">
                Donate
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/upload-prescription">
                Upload Prescription
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">
                Profile
              </Link>
            </li>
          </ul>

          {/* Auth buttons */}
          {!token ? (
            <button className="btn btn-primary ms-lg-3 mt-2 mt-lg-0">
              <Link to="/auth" className="text-white text-decoration-none">
                Login
              </Link>
            </button>
          ) : (
            <div className="d-flex align-items-center ms-lg-3 mt-2 mt-lg-0">
              <span className="me-3 fw-bold text-primary">
                👋 {user?.name}
              </span>
              <button onClick={handleLogout} className="btn btn-danger">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
