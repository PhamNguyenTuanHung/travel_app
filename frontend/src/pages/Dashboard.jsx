import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { decodeToken } from "../components/ProtectedRoute";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const token = localStorage.getItem("jwtToken");
  const user = decodeToken(token);

  const [stats, setStats] = useState({
    tours: 0,
    bookings: 0,
    destinations: 0,
    reviews: 0,
    users: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        if (user.role === "admin" || user.role === "staff") {
          // Admin & Staff statistics
          const [toursRes, bookingsRes, reviewsRes] = await Promise.all([
            api.get("/tours"),
            api.get("/bookings"),
            api.get("/reviews"),
          ]);

          let usersCount = 0;
          try {
            const usersRes = await api.get("/users");
            usersCount = Array.isArray(usersRes.data) ? usersRes.data.length : usersRes.data.count || 0;
          } catch (e) {
            console.warn("Failed to fetch users for stats", e);
          }

          let destsCount = 0;
          if (user.role === "admin") {
            try {
              const destsRes = await api.get("/destinations");
              destsCount = destsRes.data.count || destsRes.data.rows?.length || 0;
            } catch (e) {
              console.warn("Failed to fetch destinations for stats", e);
            }
          }

          setStats({
            tours: toursRes.data.count || 0,
            bookings: bookingsRes.data.count || 0,
            destinations: destsCount,
            reviews: reviewsRes.data.count || 0,
            users: usersCount,
          });

          setRecentBookings(bookingsRes.data.rows?.slice(0, 5) || []);
        } else {
          // Regular User statistics and list of bookings
          const bookingsRes = await api.get("/bookings", {
            params: { user_id: user.id },
          });
          const bookingsList = bookingsRes.data.rows || [];
          setUserBookings(bookingsList);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.role, user.id]);

  if (loading) {
    return <div style={{ color: "var(--text-h)", textAlign: "center", marginTop: "4rem" }}>Loading dashboard details...</div>;
  }

  const isAdminOrStaff = user.role === "admin" || user.role === "staff";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section className="glass-card">
        <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", textAlign: "left" }}>
          Welcome back, {user.role === "admin" ? "Administrator" : user.role === "staff" ? "Staff Member" : "Traveler"}!
        </h1>
        <p style={{ color: "var(--text)", fontSize: "1.1rem" }}>
          Role: <strong style={{ color: "var(--accent)" }}>{user.role.toUpperCase()}</strong>
        </p>
      </section>

      {error && <div className="error-msg">{error}</div>}

      {isAdminOrStaff ? (
        <>
          {/* Analytical summary cards */}
          <div className="grid-cols-3">
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", textTransform: "uppercase", color: "var(--text)" }}>Total Tours</span>
              <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent)" }}>{stats.tours}</span>
              <Link to="/tours" style={{ fontSize: "0.9rem", color: "var(--text-h)", textDecoration: "none" }}>
                Manage Tours →
              </Link>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", textTransform: "uppercase", color: "var(--text)" }}>Total Bookings</span>
              <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent)" }}>{stats.bookings}</span>
              <Link to="/bookings" style={{ fontSize: "0.9rem", color: "var(--text-h)", textDecoration: "none" }}>
                Manage Bookings →
              </Link>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", textTransform: "uppercase", color: "var(--text)" }}>Reviews Written</span>
              <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent)" }}>{stats.reviews}</span>
              <Link to="/reviews" style={{ fontSize: "0.9rem", color: "var(--text-h)", textDecoration: "none" }}>
                View Reviews →
              </Link>
            </div>

            {user.role === "admin" && (
              <>
                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.9rem", textTransform: "uppercase", color: "var(--text)" }}>Destinations</span>
                  <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent)" }}>{stats.destinations}</span>
                  <Link to="/destinations" style={{ fontSize: "0.9rem", color: "var(--text-h)", textDecoration: "none" }}>
                    Manage Destinations →
                  </Link>
                </div>

                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.9rem", textTransform: "uppercase", color: "var(--text)" }}>Registered Users</span>
                  <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent)" }}>{stats.users}</span>
                  <Link to="/users" style={{ fontSize: "0.9rem", color: "var(--text-h)", textDecoration: "none" }}>
                    Manage Users →
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Recent Bookings table */}
          <section className="glass-card">
            <h3>Recent Bookings</h3>
            {recentBookings.length === 0 ? (
              <p style={{ marginTop: "1rem" }}>No bookings have been made yet.</p>
            ) : (
              <div className="table-container">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Tour</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b.id}>
                        <td>#{b.id}</td>
                        <td>{b.user?.full_name || "Unknown"}</td>
                        <td>{b.tour?.title || "Unknown Tour"}</td>
                        <td>{b.quantity}</td>
                        <td>{parseFloat(b.total_price).toLocaleString()} VND</td>
                        <td>
                          <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          {/* Traveler Dashboard */}
          <div className="grid-cols-2">
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 style={{ margin: "0" }}>Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                <Link to="/tours" className="btn btn-primary">
                  Browse Tours
                </Link>
                <Link to="/profile" className="btn btn-secondary">
                  Update Profile
                </Link>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 style={{ margin: "0" }}>My Travel Summary</h3>
              <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.9rem", color: "var(--text)" }}>Bookings Created</span>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--accent)" }}>{userBookings.length}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.9rem", color: "var(--text)" }}>Upcoming Trips</span>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--accent)" }}>
                    {userBookings.filter((b) => b.status === "PENDING" || b.status === "PAID").length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="glass-card">
            <h3>My Recent Bookings</h3>
            {userBookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <p>You haven't booked any tours yet.</p>
                <Link to="/tours" className="btn btn-primary" style={{ display: "inline-block", width: "auto", marginTop: "1rem" }}>
                  Find a Tour
                </Link>
              </div>
            ) : (
              <div className="table-container">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tour</th>
                      <th>Destination</th>
                      <th>Guests</th>
                      <th>Total Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBookings.slice(0, 5).map((b) => (
                      <tr key={b.id}>
                        <td>#{b.id}</td>
                        <td>
                          <Link to={`/tours/${b.tour_id}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
                            {b.tour?.title || "View Details"}
                          </Link>
                        </td>
                        <td>{b.tour?.tour_destinations?.[0]?.destination?.name || b.tour?.destination?.name || "N/A"}</td>
                        <td>{b.quantity}</td>
                        <td>{parseFloat(b.total_price).toLocaleString()} VND</td>
                        <td>
                          <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
