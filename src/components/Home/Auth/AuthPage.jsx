// src/features/auth/AuthPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./AuthPage.css";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  // Auth states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

  // Role states
  const [selectedRole, setSelectedRole] = useState("");
  const [profileData, setProfileData] = useState({});

  // Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // OTP resend
  const [resendCooldown, setResendCooldown] = useState(0);
  const RESEND_TIMEOUT = 60;
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ---------------- CHECK STORED ROLE ----------------
  useEffect(() => {
    const role = localStorage.getItem("authRole");
    const user = JSON.parse(localStorage.getItem("authUser"));
    if (user && role) {
      navigate("/"); // already logged in and role chosen
    } else if (user && !role) {
      setMode("choose-role"); // logged in but no role
    }
  }, [navigate]);

  // ---------------- REGISTER ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          password_confirmation: passwordConfirmation,
          phone_number: phoneNumber,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Registered successfully, please verify OTP!");
        setMode("verify-otp");
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join("\n");
          setMessage("❌ " + errorMessages);
        } else {
          setMessage("❌ " + (data.message || "Registration failed"));
        }
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- VERIFY OTP ----------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ OTP Verified successfully, you can login now!");
        setMode("login");
      } else {
        setMessage("❌ " + (data.message || "OTP verification failed"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESEND OTP ----------------
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("📩 OTP has been resent to your email.");
        setResendCooldown(RESEND_TIMEOUT);
      } else {
        setMessage("❌ " + (data.message || "Failed to resend OTP"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token) localStorage.setItem("authToken", data.token);
        if (data.user) localStorage.setItem("authUser", JSON.stringify(data.user));
        const savedRole = localStorage.getItem("authRole");
        if (savedRole) {
          navigate("/"); // already has role
        } else {
          setMode("choose-role"); // choose role first time
        }
      } else {
        setMessage("❌ " + (data.message || "Login failed"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESET PASSWORD ----------------
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/send-password-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("📩 OTP sent to your email!");
        setMode("reset-password");
      } else {
        setMessage("❌ " + (data.message || "Failed to send reset OTP"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          password: newPassword,
          password_confirmation: newPasswordConfirmation,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Password reset successfully! You can login now.");
        setMode("login");
      } else {
        setMessage("❌ " + (data.message || "Password reset failed"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE ROLE ----------------
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole, profile_data: profileData }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        data = { message: text };
      }

      if (res.ok) {
        localStorage.setItem("authRole", selectedRole); // save role permanently
        setMessage("✅ Role updated successfully!");
        navigate("/");
      } else {
        console.error("Update role error:", { status: res.status, data });
        setMessage(`❌ ${res.status} - ${data.message || "Failed to update role"}`);
      }
    } catch (err) {
      console.error("Update role exception:", err);
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="auth-page d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg p-4 p-md-5 w-100" style={{ maxWidth: "500px", borderRadius: "15px" }}>
        <h2 className="text-center mb-4">
          {mode === "login" ? "Login" :
           mode === "register" ? "Register" :
           mode === "verify-otp" ? "Verify OTP" :
           mode === "reset-request" ? "Forgot Password" :
           mode === "reset-password" ? "Reset Password" :
           mode === "choose-role" ? "Choose Role" :
           mode === "role-form" ? `Complete ${selectedRole} Profile` : ""}
        </h2>

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <input className="form-control mb-2" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
            <div className="input-group mb-2">
              <input type={showPassword?"text":"password"} className="form-control" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
              <span className="input-group-text" onClick={()=>setShowPassword(!showPassword)} style={{cursor:"pointer"}}>
                <i className={`fa ${showPassword?"fa-eye-slash":"fa-eye"}`}></i>
              </span>
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>{loading?"Logging in...":"Login"}</button>
            <div className="text-center mt-2">
              <span className="text-danger fw-bold" style={{cursor:"pointer"}} onClick={()=>setMode("reset-request")}>Forgot Password?</span>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === "register" && (
          <form onSubmit={handleRegister}>
            <input className="form-control mb-2" placeholder="Full Name" value={fullName} onChange={(e)=>setFullName(e.target.value)} required/>
            <input className="form-control mb-2" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
            <div className="input-group mb-2">
              <input type={showPassword?"text":"password"} className="form-control" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
              <span className="input-group-text" onClick={()=>setShowPassword(!showPassword)} style={{cursor:"pointer"}}>
                <i className={`fa ${showPassword?"fa-eye-slash":"fa-eye"}`}></i>
              </span>
            </div>
            <div className="input-group mb-2">
              <input type={showPasswordConfirm?"text":"password"} className="form-control" placeholder="Confirm Password" value={passwordConfirmation} onChange={(e)=>setPasswordConfirmation(e.target.value)} required/>
              <span className="input-group-text" onClick={()=>setShowPasswordConfirm(!showPasswordConfirm)} style={{cursor:"pointer"}}>
                <i className={`fa ${showPasswordConfirm?"fa-eye-slash":"fa-eye"}`}></i>
              </span>
            </div>
            <input className="form-control mb-2" placeholder="Phone Number" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)} required/>
            <button className="btn btn-primary w-100" disabled={loading}>{loading?"Registering...":"Register"}</button>
          </form>
        )}

        {/* VERIFY OTP FORM */}
        {mode === "verify-otp" && (
          <form onSubmit={handleVerifyOtp}>
            <input className="form-control mb-2" placeholder="Enter OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} required/>
            <button className="btn btn-success w-100" disabled={loading}>{loading?"Verifying...":"Verify OTP"}</button>
            <div className="text-center mt-2">
              {resendCooldown>0 ? <span className="text-muted">Resend OTP in {resendCooldown}s</span> : <span className="text-primary fw-bold" style={{cursor:"pointer"}} onClick={handleResendOtp}>Resend OTP</span>}
            </div>
          </form>
        )}

        {/* RESET REQUEST */}
        {mode === "reset-request" && (
          <form onSubmit={handleSendResetOtp}>
            <input type="email" className="form-control mb-2" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
            <button className="btn btn-warning w-100" disabled={loading}>{loading?"Sending...":"Send Reset OTP"}</button>
          </form>
        )}

        {/* RESET PASSWORD */}
        {mode === "reset-password" && (
          <form onSubmit={handleResetPassword}>
            <input className="form-control mb-2" placeholder="Enter OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} required/>
            <div className="input-group mb-2">
              <input type={showNewPassword?"text":"password"} className="form-control" placeholder="New Password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required/>
              <span className="input-group-text" onClick={()=>setShowNewPassword(!showNewPassword)} style={{cursor:"pointer"}}>
                <i className={`fa ${showNewPassword?"fa-eye-slash":"fa-eye"}`}></i>
              </span>
            </div>
            <div className="input-group mb-2">
              <input type={showNewPasswordConfirm?"text":"password"} className="form-control" placeholder="Confirm New Password" value={newPasswordConfirmation} onChange={(e)=>setNewPasswordConfirmation(e.target.value)} required/>
              <span className="input-group-text" onClick={()=>setShowNewPasswordConfirm(!showNewPasswordConfirm)} style={{cursor:"pointer"}}>
                <i className={`fa ${showNewPasswordConfirm?"fa-eye-slash":"fa-eye"}`}></i>
              </span>
            </div>
            <button className="btn btn-success w-100" disabled={loading}>{loading?"Resetting...":"Reset Password"}</button>
          </form>
        )}

        {/* CHOOSE ROLE */}
        {mode === "choose-role" && (
          <form onSubmit={(e)=>{e.preventDefault(); setMode("role-form");}}>
            <select className="form-control mb-3" value={selectedRole} onChange={(e)=>setSelectedRole(e.target.value)} required>
              <option value="">-- Choose Role --</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="pharmacy">Pharmacy</option>
            </select>
            <button className="btn btn-success w-100" disabled={!selectedRole}>Continue</button>
          </form>
        )}

        {/* ROLE FORM */}
        {mode === "role-form" && (
          <form onSubmit={handleUpdateRole}>
            {selectedRole === "patient" && (
              <>
                <input type="date" className="form-control mb-2" value={profileData.date_of_birth||""} onChange={(e)=>setProfileData({...profileData,date_of_birth:e.target.value})} required/>
                <input className="form-control mb-2" placeholder="Gender" onChange={(e)=>setProfileData({...profileData,gender:e.target.value})} required/>
                <input className="form-control mb-2" placeholder="National ID" onChange={(e)=>setProfileData({...profileData,national_id:e.target.value})} required/>
                <textarea className="form-control mb-2" placeholder="Medical History" onChange={(e)=>setProfileData({...profileData,medical_history_summary:e.target.value})} required/>
                <input className="form-control mb-2" placeholder="Default Address" onChange={(e)=>setProfileData({...profileData,default_address:e.target.value})} required/>
              </>
            )}
            {selectedRole === "doctor" && (
              <>
                <input className="form-control mb-2" placeholder="Medical License ID" onChange={(e)=>setProfileData({...profileData,medical_license_id:e.target.value})} required/>
                <input className="form-control mb-2" placeholder="Specialization" onChange={(e)=>setProfileData({...profileData,specialization:e.target.value})} required/>
                <input className="form-control mb-2" placeholder="Clinic Address" onChange={(e)=>setProfileData({...profileData,clinic_address:e.target.value})} required/>
              </>
            )}
            {selectedRole === "pharmacy" && (
              <>
                <input className="form-control mb-2" placeholder="Location" onChange={(e)=>setProfileData({...profileData,location:e.target.value})} required/>
                <input type="number" step="any" min="-90" max="90" className="form-control mb-2" placeholder="Latitude" onChange={(e)=>setProfileData({...profileData,latitude:parseFloat(e.target.value)})} required/>
                <input type="number" step="any" min="-180" max="180" className="form-control mb-2" placeholder="Longitude" onChange={(e)=>setProfileData({...profileData,longitude:parseFloat(e.target.value)})} required/>
                <input className="form-control mb-2" placeholder="Contact Info" onChange={(e)=>setProfileData({...profileData,contact_info:e.target.value})} required/>
              </>
            )}
            <button className="btn btn-primary w-100" disabled={loading}>{loading?"Saving...":"Save Profile"}</button>
          </form>
        )}

        {message && <div className="alert alert-info mt-3">{message}</div>}

        {/* TOGGLE LOGIN/REGISTER */}
        {mode !== "choose-role" && mode !== "role-form" && (
          <div className="text-center mt-3">
            {mode==="login" ? (
              <span>Don’t have an account? <span className="text-primary fw-bold" style={{cursor:"pointer"}} onClick={()=>setMode("register")}>Register</span></span>
            ) : (
              <span>Already have an account? <span className="text-primary fw-bold" style={{cursor:"pointer"}} onClick={()=>setMode("login")}>Login</span></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
