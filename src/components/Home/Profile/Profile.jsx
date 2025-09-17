// src/features/profile/Profile.jsx
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../config";
import "./Profile.css"; // Import the new CSS file
import { 
  FaUserCircle, FaEnvelope, FaPhone, FaUserTag, FaCheckCircle, 
  FaTimesCircle, FaClock, FaPlaneDeparture 
} from 'react-icons/fa'; // Using react-icons for a professional look

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false); // State for the toggle action
  const authRole = localStorage.getItem("authRole");

  // Fetch initial user data
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(`${BASE_URL}auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
        } else {
          setError(data.message || "Failed to fetch user data.");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle toggling travel mode and persist the change
  const handleToggleTravelMode = async () => {
    if (!user || isUpdating) return;

    setIsUpdating(true);
    const originalTravelMode = user.travel_mode;

    // Optimistically update the UI for a better user experience
    setUser({ ...user, travel_mode: !originalTravelMode });

    try {
      // **IMPORTANT**: This is where you would make your PATCH/PUT request
      // const token = localStorage.getItem("authToken");
      // const response = await fetch(`${BASE_URL}user/travel-mode`, {
      //   method: 'PATCH',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}` 
      //   },
      //   body: JSON.stringify({ travel_mode: !originalTravelMode }),
      // });

      // if (!response.ok) {
      //   // If the API call fails, revert the change and show an error
      //   setUser({ ...user, travel_mode: originalTravelMode });
      //   alert("Failed to update travel mode. Please try again.");
      // }
      
      // Simulating a successful API call for demonstration
      await new Promise(resolve => setTimeout(resolve, 500)); 
      console.log("Travel mode updated successfully.");

    } catch (err) {
      // Revert the change on network error
      setUser({ ...user, travel_mode: originalTravelMode });
      alert("An error occurred. Please check your connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="profile-feedback">Loading Profile...</div>;
  }

  if (error) {
    return <div className="profile-feedback error">{error}</div>;
  }
  
  if (!user) {
    return <div className="profile-feedback">No user data found.</div>
  }

  // Helper to format dates
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          {user.profile_picture_path ? (
            <img
              src={user.profile_picture_path}
              alt={user.name}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-initials-avatar">
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          )}
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
        </div>

        <hr className="profile-divider" />

        {/* Profile Details */}
        <div className="profile-details">
          <div className="detail-item">
            <FaPhone className="detail-icon" />
            <div>
              <span className="detail-label">Phone</span>
              <p className="detail-value">{user.phone_number}</p>
            </div>
          </div>
          <div className="detail-item">
            <FaUserTag className="detail-icon" />
            <div>
              <span className="detail-label">Role</span>
              <p className="detail-value">
                <span className={`badge role-${user.role}`}>{user.role}</span>
              </p>
            </div>
          </div>
          <div className="detail-item">
            <FaCheckCircle className="detail-icon" />
            <div>
              <span className="detail-label">Status</span>
              <p className="detail-value">
                <span className={`badge status-${user.status}`}>{user.status}</span>
              </p>
            </div>
          </div>
          <div className="detail-item">
            {user.email_verified_at ? <FaCheckCircle className="detail-icon verified" /> : <FaTimesCircle className="detail-icon not-verified" />}
            <div>
              <span className="detail-label">Email Verified</span>
              <p className="detail-value">{user.email_verified_at ? "Yes" : "No"}</p>
            </div>
          </div>
          <div className="detail-item">
            <FaClock className="detail-icon" />
            <div>
              <span className="detail-label">Member Since</span>
              <p className="detail-value">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </div>
        
        {/* Actions Section */}
        {authRole === "patient" && (
          <>
            <hr className="profile-divider" />
            <div className="profile-actions">
              <FaPlaneDeparture className="detail-icon" />
              <div className="action-label">
                <span className="detail-label">Travel Mode</span>
                <p className="detail-value">{user.travel_mode ? "You are currently marked as traveling" : "You are at your home location"}</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={user.travel_mode} 
                  onChange={handleToggleTravelMode}
                  disabled={isUpdating}
                />
                <span className="slider"></span>
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}