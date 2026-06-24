import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { decodeToken } from "../components/ProtectedRoute";
import { Button } from "../components/Button";

export const Bookings = () => {
  const token = localStorage.getItem("jwtToken");
  const user = decodeToken(token);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const isAdminOrStaff = user.role === "admin" || user.role === "staff";

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        limit,
        page,
      };

      // If they are a regular user, filter by their user_id
      if (user.role === "user") {
        params.user_id = user.id;
      }

      const { data } = await api.get("/bookings", { params });
      setBookings(data.rows || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}`, { status: newStatus });
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking permanently?")) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete booking");
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="header-actions">
        <h2 style={{ margin: "0" }}>{isAdminOrStaff ? "Manage All Bookings" : "My Tour Bookings"}</h2>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div style={{ color: "var(--text-h)", textAlign: "center", marginTop: "2rem" }}>Loading bookings records...</div>
      ) : bookings.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p>No bookings records found.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  {isAdminOrStaff && <th>Customer Name</th>}
                  {isAdminOrStaff && <th>Email</th>}
                  <th>Tour Name</th>
                  <th>Guests</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  {isAdminOrStaff && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    {isAdminOrStaff && <td>{b.user?.full_name || "Unknown"}</td>}
                    {isAdminOrStaff && <td>{b.user?.email || "N/A"}</td>}
                    <td>
                      <strong>{b.tour?.title || "Deleted Tour"}</strong>
                    </td>
                    <td>{b.quantity}</td>
                    <td>{parseFloat(b.total_price).toLocaleString()} VND</td>
                    <td>
                      {isAdminOrStaff ? (
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="glass-input"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.9rem", width: "auto" }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      ) : (
                        <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                      )}
                    </td>
                    {isAdminOrStaff && (
                      <td>
                        {user.role === "admin" && (
                          <Button
                            onClick={() => handleDelete(b.id)}
                            variant="danger"
                            style={{ width: "auto", padding: "0.25rem 0.75rem", fontSize: "0.9rem" }}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem", alignItems: "center" }}>
              <Button onClick={() => setPage(page - 1)} disabled={page === 1} style={{ width: "auto" }} variant="secondary">
                ← Prev
              </Button>
              <span style={{ color: "var(--text-h)" }}>
                Page <strong>{page}</strong> of {totalPages}
              </span>
              <Button onClick={() => setPage(page + 1)} disabled={page === totalPages} style={{ width: "auto" }} variant="secondary">
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
