import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { decodeToken } from "../components/ProtectedRoute";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export const Reviews = () => {
  const token = localStorage.getItem("jwtToken");
  const user = decodeToken(token);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Edit Review Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentReview, setCurrentReview] = useState({
    id: null,
    rating: 5,
    comment: "",
  });

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        limit,
        page,
      };

      const { data } = await api.get("/reviews", { params });
      setReviews(data.rows || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete review");
    }
  };

  const openEditModal = (review) => {
    setCurrentReview({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/reviews/${currentReview.id}`, {
        rating: parseInt(currentReview.rating),
        comment: currentReview.comment,
      });
      setShowEditModal(false);
      fetchReviews();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update review");
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="header-actions">
        <h2 style={{ margin: "0" }}>Traveler Feedback Logs</h2>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div style={{ color: "var(--text-h)", textAlign: "center", marginTop: "2rem" }}>Loading reviews list...</div>
      ) : reviews.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p>No traveler reviews found.</p>
        </div>
      ) : (
        <>
          <div className="grid-cols-2">
            {reviews.map((rev) => {
              const isOwner = rev.user_id === user.id;
              const canDelete = isOwner || user.role === "admin" || user.role === "staff";
              const canEdit = isOwner;

              return (
                <div key={rev.id} className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <strong style={{ fontSize: "1.1rem" }}>{rev.user?.full_name || "Anonymous"}</strong>
                        <span style={{ fontSize: "0.85rem", color: "var(--text)", block: "block", marginLeft: "0.5rem" }}>
                          ({rev.user?.email || "N/A"})
                        </span>
                      </div>
                      <span style={{ color: "#fbbf24", fontWeight: "bold", fontSize: "1.1rem" }}>{"★".repeat(rev.rating)}</span>
                    </div>

                    <p style={{ fontSize: "0.9rem", color: "var(--accent)", marginBottom: "1rem" }}>
                      📍 Destination: <strong>{rev.destination?.name || "Deleted Destination"}</strong>
                    </p>

                    <p style={{ color: "var(--text)", fontStyle: "italic", fontSize: "1rem", lineHeight: "1.5" }}>"{rev.comment}"</p>
                  </div>

                  {(canEdit || canDelete) && (
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                      {canEdit && (
                        <Button onClick={() => openEditModal(rev)} variant="secondary" style={{ width: "auto", padding: "0.25rem 0.75rem", fontSize: "0.9rem" }}>
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button onClick={() => handleDelete(rev.id)} variant="danger" style={{ width: "auto", padding: "0.25rem 0.75rem", fontSize: "0.9rem" }}>
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Update Review</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="modal-rating">Rating</label>
                <select
                  id="modal-rating"
                  value={currentReview.rating}
                  onChange={(e) => setCurrentReview({ ...currentReview, rating: e.target.value })}
                  className="glass-input"
                  required
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="modal-comment">Comment</label>
                <textarea
                  id="modal-comment"
                  value={currentReview.comment}
                  onChange={(e) => setCurrentReview({ ...currentReview, comment: e.target.value })}
                  className="glass-input"
                  rows="4"
                  required
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <Button type="button" onClick={() => setShowEditModal(false)} variant="secondary">
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
