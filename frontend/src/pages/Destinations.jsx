import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { decodeToken } from "../components/ProtectedRoute";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export const Destinations = () => {
  const token = localStorage.getItem("jwtToken");
  const user = decodeToken(token);

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [currentDest, setCurrentDest] = useState({
    id: null,
    name: "",
    province: "",
    description: "",
    image_url: "",
  });

  const fetchDestinations = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/destinations");
      // destinations API returns { count, rows }
      setDestinations(data.rows || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch destinations. Make sure you have Administrator permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "WARNING: Deleting this destination will delete all associated tours, bookings, and reviews in the database. Are you sure you want to proceed?"
      )
    )
      return;

    try {
      await api.delete(`/destinations/${id}`);
      fetchDestinations();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete destination");
    }
  };

  const openAddModal = () => {
    setModalType("add");
    setCurrentDest({
      id: null,
      name: "",
      province: "",
      description: "",
      image_url: "",
    });
    setShowModal(true);
  };

  const openEditModal = (dest) => {
    setModalType("edit");
    setCurrentDest({
      id: dest.id,
      name: dest.name,
      province: dest.province,
      description: dest.description || "",
      image_url: dest.image_url || "",
    });
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        await api.post("/destinations", currentDest);
      } else {
        await api.put(`/destinations/${currentDest.id}`, currentDest);
      }
      setShowModal(false);
      fetchDestinations();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleModalChange = (e) => {
    setCurrentDest({ ...currentDest, [e.target.name]: e.target.value });
  };

  if (user.role !== "admin") {
    return (
      <div className="glass-card" style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center" }}>
        <h2 style={{ color: "#ff6b6b" }}>Access Denied</h2>
        <p>Only Administrators can manage destinations directly. Normal users can explore destinations on the Tours catalog page.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="header-actions">
        <h2 style={{ margin: "0" }}>Manage Travel Destinations</h2>
        <Button onClick={openAddModal} style={{ width: "auto" }}>
          + Add Destination
        </Button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div style={{ color: "var(--text-h)", textAlign: "center", marginTop: "2rem" }}>Loading destinations list...</div>
      ) : destinations.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p>No destinations found in the system. Click "Add Destination" to register one.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Thumbnail</th>
                <th>Destination Name</th>
                <th>Province</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((dest) => (
                <tr key={dest.id}>
                  <td>#{dest.id}</td>
                  <td>
                    {dest.image_url ? (
                      <img
                        src={dest.image_url}
                        alt={dest.name}
                        style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "60px",
                          height: "40px",
                          borderRadius: "4px",
                          background: "var(--accent-bg)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>{dest.name}</strong>
                  </td>
                  <td>{dest.province}</td>
                  <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {dest.description || "N/A"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button onClick={() => openEditModal(dest)} variant="secondary" style={{ width: "auto", padding: "0.25rem 0.75rem" }}>
                        Edit
                      </Button>
                      <Button onClick={() => handleDelete(dest.id)} variant="danger" style={{ width: "auto", padding: "0.25rem 0.75rem" }}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Destination Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{modalType === "add" ? "Create Destination" : "Update Destination"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleModalSubmit}>
              <Input
                label="Destination Name"
                name="name"
                value={currentDest.name}
                onChange={handleModalChange}
                placeholder="E.g., Halong Bay"
                required
              />
              <Input
                label="Province"
                name="province"
                value={currentDest.province}
                onChange={handleModalChange}
                placeholder="E.g., Quang Ninh"
                required
              />
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={currentDest.description}
                  onChange={handleModalChange}
                  className="glass-input"
                  rows="3"
                  placeholder="E.g., World Natural Heritage site..."
                  style={{ resize: "vertical" }}
                />
              </div>
              <Input
                label="Image URL"
                name="image_url"
                value={currentDest.image_url}
                onChange={handleModalChange}
                placeholder="E.g., https://example.com/halong.jpg"
              />

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <Button type="button" onClick={() => setShowModal(false)} variant="secondary">
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
