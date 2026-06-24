import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { decodeToken } from "./ProtectedRoute";
import "./NavBar.css";

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("jwtToken");

  // Do not render the NavBar on the login and register pages
  if (location.pathname === "/login" || location.pathname === "/register" || !token) {
    return null;
  }

  const user = decodeToken(token);
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  const isAdmin = user.role === "admin";

  return (
    <nav className="navbar glass-card">
      <ul className="nav-list">
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/tours">Tours</Link>
        </li>
        <li>
          <Link to="/bookings">Bookings</Link>
        </li>
        <li>
          <Link to="/reviews">Reviews</Link>
        </li>
        
        {/* Admin Specific Links */}
        {isAdmin && (
          <>
            <li>
              <Link to="/destinations">Destinations</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
          </>
        )}

        <li>
          <Link to="/profile" style={{ color: "var(--accent)" }}>My Profile</Link>
        </li>

        <li>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};
