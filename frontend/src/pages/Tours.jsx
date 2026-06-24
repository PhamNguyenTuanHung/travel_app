import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { decodeToken } from "../components/ProtectedRoute";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Link } from "react-router-dom";

export const Tours = () => {
  const token = localStorage.getItem("jwtToken");
  const user = decodeToken(token);
  const isAdminOrStaff = user.role === "admin" || user.role === "staff";

  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters and Pagination
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [currentTour, setCurrentTour] = useState({
    id: null,
    title: "",
    duration_days: "",
    price: "",
    max_guests: "",
    destination_id: "",
  });

  const fetchTours = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        limit,
        page,
      };
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await api.get("/tours", { params });
      setTours(data.rows || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tours.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      // destinations fetch is mainly accessible to admin
      const { data } = await api.get("/destinations");
      setDestinations(data.rows || []);
    } catch (err) {
      console.warn("Could not load destinations list (only admins can query /destinations directly). Falling back to destination_id manual input.");
    }
  };

  useEffect(() => {
    fetchTours();
  }, [page, search, minPrice, maxPrice]);

  useEffect(() => {
    if (isAdminOrStaff) {
      fetchDestinations();
    }
  }, [isAdminOrStaff]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) return;
    try {
      await api.delete(`/tours/${id}`);
      fetchTours();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete tour");
    }
  };

  const openAddModal = () => {
    setModalType("add");
    setCurrentTour({
      id: null,
      title: "",
      duration_days: "",
      price: "",
      max_guests: "",
      destination_id: destinations[0]?.id || "",
    });
    setShowModal(true);
  };

  const openEditModal = (tour) => {
    setModalType("edit");
    setCurrentTour({
      id: tour.id,
      title: tour.title,
      duration_days: tour.duration_days,
      price: tour.price,
      max_guests: tour.max_guests,
      destination_id: tour.destination_id,
    });
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: currentTour.title,
        duration_days: parseInt(currentTour.duration_days),
        price: parseFloat(currentTour.price),
        max_guests: parseInt(currentTour.max_guests),
        destination_id: parseInt(currentTour.destination_id),
      };

      if (modalType === "add") {
        await api.post("/tours", payload);
      } else {
        await api.put(`/tours/${currentTour.id}`, payload);
      }
      setShowModal(false);
      fetchTours();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleModalChange = (e) => {
    setCurrentTour({ ...currentTour, [e.target.name]: e.target.value });
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="header-actions">
        <h2 style={{ margin: "0" }}>Explore Beautiful Tours</h2>
        {isAdminOrStaff && (
          <Button onClick={openAddModal} style={{ width: "auto" }}>
            + Create Tour
          </Button>
        )}
      </div>

      {/* Filter panel */}
      <section className="glass-card search-filter-bar">
        <div style={{ display: "flex", gap: "1rem", flex: 2, minWidth: "250px" }}>
          <input
            type="text"
            placeholder="Search tours..."
            className="glass-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", flex: 1, minWidth: "150px" }}>
          <input
            type="number"
            placeholder="Min Price"
            className="glass-input"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", flex: 1, minWidth: "150px" }}>
          <input
            type="number"
            placeholder="Max Price"
            className="glass-input"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </section>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div style={{ color: "var(--text-h)", textAlign: "center", marginTop: "2rem" }}>Searching matching tours...</div>
      ) : tours.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p>No tours found matching your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid-cols-3">
            {tours.map((tour) => (
              <div key={tour.id} className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  {tour.destination?.image_url ? (
                    <img
                      src={tour.destination.image_url}
                      alt={tour.title}
                      style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "1rem" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "160px",
                        borderRadius: "8px",
                        background: "var(--accent-bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent)",
                        marginBottom: "1rem",
                        fontWeight: "600",
                      }}
                    >
                      No Image Available
                    </div>
                  )}
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-h)" }}>{tour.title}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text)", marginBottom: "1rem" }}>
                    📍 Destination: <strong>{tour.destination?.name || "Unknown"}</strong>
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", margin: "0.5rem 0", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                    <span>Duration:</span>
                    <strong>{tour.duration_days} days</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", margin: "0.5rem 0", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                    <span>Capacity:</span>
                    <strong>{tour.max_guests} guests max</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", margin: "1rem 0" }}>
                    <span>Price:</span>
                    <strong style={{ color: "var(--accent)" }}>{parseFloat(tour.price).toLocaleString()} VND</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                  <Link to={`/tours/${tour.id}`} className="btn btn-primary" style={{ flex: 1 }}>
                    View Details
                  </Link>

                  {isAdminOrStaff && (
                    <>
                      <Button onClick={() => openEditModal(tour)} variant="secondary" style={{ width: "auto", padding: "0.5rem 1rem" }}>
                        Edit
                      </Button>
                      <Button onClick={() => handleDelete(tour.id)} variant="danger" style={{ width: "auto", padding: "0.5rem 1rem" }}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{modalType === "add" ? "Create Tour" : "Update Tour"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleModalSubmit}>
              <Input
                label="Tour Title"
                name="title"
                value={currentTour.title}
                onChange={handleModalChange}
                placeholder="E.g., Halong Bay Cruise"
                required
              />
              <Input
                label="Duration (Days)"
                name="duration_days"
                type="number"
                value={currentTour.duration_days}
                onChange={handleModalChange}
                placeholder="2"
                required
              />
              <Input
                label="Price (VND)"
                name="price"
                type="number"
                value={currentTour.price}
                onChange={handleModalChange}
                placeholder="2500000"
                required
              />
              <Input
                label="Max Guests"
                name="max_guests"
                type="number"
                value={currentTour.max_guests}
                onChange={handleModalChange}
                placeholder="10"
                required
              />

              <div className="form-group">
                <label>Destination</label>
                {destinations.length > 0 ? (
                  <select
                    name="destination_id"
                    value={currentTour.destination_id}
                    onChange={handleModalChange}
                    className="glass-input"
                    required
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.province})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    name="destination_id"
                    placeholder="Enter Destination ID"
                    value={currentTour.destination_id}
                    onChange={handleModalChange}
                    className="glass-input"
                    required
                  />
                )}
              </div>

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
