import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { decodeToken } from "../components/ProtectedRoute";
import { Button } from "../components/Button";

export const Users = () => {
  const token = localStorage.getItem("jwtToken");
  const user = decodeToken(token);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users");
      setUsers(Array.isArray(data) ? data : data.rows || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users. Access is restricted to Administrators & Staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUserId, currentRoleVal, newRoleId) => {
    if (targetUserId === user.id) {
      alert("You cannot change your own role!");
      return;
    }

    try {
      await api.put(`/users/${targetUserId}`, { role_id: parseInt(newRoleId) });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleDelete = async (targetUserId) => {
    if (targetUserId === user.id) {
      alert("You cannot delete your own account!");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user? This action is irreversible.")) return;

    try {
      await api.delete(`/users/${targetUserId}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const getRoleName = (roleId) => {
    switch (parseInt(roleId)) {
      case 1:
        return "Admin";
      case 2:
        return "User";
      case 3:
        return "Staff";
      default:
        return `Role ${roleId}`;
    }
  };

  if (user.role !== "admin") {
    return (
      <div className="glass-card" style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center" }}>
        <h2 style={{ color: "#ff6b6b" }}>Access Denied</h2>
        <p>Only Administrators can view and manage user role levels.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="header-actions">
        <h2 style={{ margin: "0" }}>Manage User Roles</h2>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div style={{ color: "var(--text-h)", textAlign: "center", marginTop: "2rem" }}>Loading user database...</div>
      ) : users.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p>No users found in database.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>
                    <strong>{u.full_name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone || "N/A"}</td>
                  <td>
                    <select
                      value={u.role_id}
                      onChange={(e) => handleRoleChange(u.id, u.role_id, e.target.value)}
                      disabled={u.id === user.id}
                      className="glass-input"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.9rem", width: "auto" }}
                    >
                      <option value="1">Admin</option>
                      <option value="2">User</option>
                      <option value="3">Staff</option>
                    </select>
                  </td>
                  <td>
                    <Button
                      onClick={() => handleDelete(u.id)}
                      disabled={u.id === user.id}
                      variant="danger"
                      style={{ width: "auto", padding: "0.25rem 0.75rem", fontSize: "0.9rem" }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
