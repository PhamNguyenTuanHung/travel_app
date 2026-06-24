import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { decodeToken } from "../components/ProtectedRoute";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");
  const user = decodeToken(token);

  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking Form State
  const [bookingQty, setBookingQty] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const fetchTourDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/tours/${id}`);
      setTour(data);
      if (data.destination_id) {
        fetchDestinationReviews(data.destination_id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load tour details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinationReviews = async (destId) => {
    try {
      const { data } = await api.get("/reviews", {
        params: { destination_id: destId },
      });
      setReviews(data.rows || []);
    } catch (err) {
      console.error("Failed to load destination reviews", err);
    }
  };

  useEffect(() => {
    fetchTourDetails();
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess("");
    setBookingError("");
    try {
      const payload = {
        tour_id: tour.id,
        quantity: parseInt(bookingQty),
      };
      await api.post("/bookings", payload);
      setBookingSuccess("Booking placed successfully!");
      setTimeout(() => {
        navigate("/bookings");
      }, 1500);
    } catch (err) {
      console.error(err);
      setBookingError(err.response?.data?.message || "Booking creation failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError("");
    setReviewSuccess("");
    try {
      const payload = {
        destination_id: tour.destination_id,
        rating: parseInt(rating),
        comment,
      };
      await api.post("/reviews", payload);
      setReviewSuccess("Review submitted successfully!");
      setComment("");
      fetchDestinationReviews(tour.destination_id);
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: "var(--text-h)", textAlign: "center", marginTop: "4rem" }}>Retrieving tour itinerary...</div>;
  }

  if (error || !tour) {
    return (
      <div className="glass-card" style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center" }}>
        <h2 style={{ color: "#ff6b6b" }}>Error</h2>
        <p>{error || "Tour not found"}</p>
        <Link to="/tours" className="btn btn-secondary" style={{ marginTop: "1rem", display: "inline-block", width: "auto" }}>
          Back to Tours
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <Link to="/tours" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "600", fontSize: "0.95rem" }}>
          ← Back to Tours
        </Link>
      </div>

      <div className="grid-cols-3">
        {/* Tour Details (Left side, takes 2 columns in large layout) */}
        <section className="glass-card" style={{ gridColumn: "span 2" }}>
          <div className="detail-header">
            <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2.2rem" }}>{tour.title}</h1>
            <p style={{ color: "var(--accent)", fontSize: "1.1rem" }}>
              📍 <strong>{tour.destination?.name}</strong>, {tour.destination?.province}
            </p>
          </div>

          <div className="detail-body">
            {tour.destination?.image_url && (
              <img
                src={tour.destination.image_url}
                alt={tour.title}
                style={{ width: "100%", maxHeight: "350px", objectFit: "cover", borderRadius: "10px", marginBottom: "1.5rem" }}
              />
            )}

            <h3>About this Destination</h3>
            <p style={{ marginBottom: "2rem", color: "var(--text)" }}>
              {tour.destination?.description || "No description provided for this destination."}
            </p>

            <h3>Itinerary Details</h3>
            <div className="meta-info">
              <div className="glass-card" style={{ padding: "1rem", flex: 1, textAlign: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text)" }}>Duration</span>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent)", marginTop: "0.25rem" }}>
                  {tour.duration_days} Days
                </div>
              </div>

              <div className="glass-card" style={{ padding: "1rem", flex: 1, textAlign: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text)" }}>Max Capacity</span>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent)", marginTop: "0.25rem" }}>
                  {tour.max_guests} Guests
                </div>
              </div>

              <div className="glass-card" style={{ padding: "1rem", flex: 1, textAlign: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text)" }}>Price Per Traveler</span>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent)", marginTop: "0.25rem" }}>
                  {parseFloat(tour.price).toLocaleString()} VND
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Card (Right side, takes 1 column) */}
        <section className="glass-card" style={{ height: "fit-content" }}>
          <h3 style={{ marginTop: 0 }}>Book This Tour</h3>
          <p style={{ color: "var(--text)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Reserve your seats now. Total price is calculated based on guest count.
          </p>

          {bookingError && <div className="error-msg">{bookingError}</div>}
          {bookingSuccess && <div className="success-msg">{bookingSuccess}</div>}

          <form onSubmit={handleBookingSubmit}>
            <Input
              label="Number of Guests"
              name="quantity"
              type="number"
              min="1"
              max={tour.max_guests}
              value={bookingQty}
              onChange={(e) => setBookingQty(e.target.value)}
              required
            />

            <div style={{ margin: "1.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "500" }}>Total Price:</span>
              <strong style={{ fontSize: "1.4rem", color: "var(--accent)" }}>
                {(parseFloat(tour.price) * (parseInt(bookingQty) || 0)).toLocaleString()} VND
              </strong>
            </div>

            <Button type="submit" disabled={bookingLoading || bookingQty < 1}>
              {bookingLoading ? "Reserving..." : "Confirm Booking"}
            </Button>
          </form>
        </section>
      </div>

      {/* Reviews Section */}
      <section className="glass-card">
        <h3>Reviews for {tour.destination?.name}</h3>

        <div className="grid-cols-3" style={{ marginTop: "1.5rem" }}>
          {/* Review List (Takes 2 cols) */}
          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.length === 0 ? (
              <p style={{ color: "var(--text)" }}>No reviews posted yet for this destination. Be the first to write one!</p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    padding: "1rem",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <strong>{rev.user?.full_name || "Unknown traveler"}</strong>
                    <span style={{ color: "#fbbf24", fontWeight: "bold" }}>{"★".repeat(rev.rating)}</span>
                  </div>
                  <p style={{ color: "var(--text)", fontStyle: "italic", fontSize: "0.95rem" }}>"{rev.comment}"</p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Form (Takes 1 col, only show if standard User role) */}
          {user.role === "user" && (
            <div
              style={{
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "rgba(255, 255, 255, 0.03)",
                height: "fit-content",
              }}
            >
              <h4 style={{ margin: "0 0 1rem 0" }}>Write a Review</h4>
              {reviewError && <div className="error-msg">{reviewError}</div>}
              {reviewSuccess && <div className="success-msg">{reviewSuccess}</div>}

              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label htmlFor="rating">Rating</label>
                  <select
                    id="rating"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="glass-input"
                    required
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Good)</option>
                    <option value="3">3 Stars (Average)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Terrible)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="comment">Comment</label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="glass-input"
                    rows="3"
                    placeholder="Share your travel experience..."
                    required
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <Button type="submit" disabled={reviewLoading}>
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
