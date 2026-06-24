import React from "react";
import { Navigate } from "react-router-dom";

export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Token decoding failed:", e);
    return null;
  }
};

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = decodeToken(token);

  if (!user) {
    localStorage.removeItem("jwtToken");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="glass-card" style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center" }}>
        <h2 style={{ color: "#ff6b6b" }}>Access Denied</h2>
        <p style={{ margin: "1rem 0" }}>You do not have permission to view this page ({user.role}).</p>
        <a href="/dashboard" className="btn btn-secondary" style={{ display: "inline-block", width: "auto" }}>
          Go to Dashboard
        </a>
      </div>
    );
  }

  return children;
};
