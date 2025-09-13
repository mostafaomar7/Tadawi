import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("authToken"); // افحص إذا المستخدم مسجل دخول

  if (!token) {
    // إذا مفيش توكن، حوله لصفحة تسجيل الدخول
    return <Navigate to="/auth" replace />;
  }

  return children; // إذا موجود توكن، خلي المستخدم يدخل الصفحة
}
