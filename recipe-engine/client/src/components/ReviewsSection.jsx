/**
 * @file ReviewsSection.jsx
 * @description Reviews section for the recipe detail page.
 * @author Hossein (scaffold), Anna (implementation)
 * NEW FEATURES ADDED:
 *  - Delete own review button
 *  - Character counter on textarea
 *  - Average rating summary bar at top
 *  - Login prompt for non-logged-in users
 *  - Fixed API endpoint path (was /reviews/:recipeId, now correct)
 */

import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./ReviewsSection.css";

/**
 * ReviewsSection component.
 * @param {object} props
 * @param {string} props.recipeId - The recipe's MongoDB _id
 */
const ReviewsSection = ({ recipeId }) => {
  const { user }                            = useAuth();
  const [reviews, setReviews]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [rating, setRating]                 = useState(0);
  const [hoverRating, setHoverRating]       = useState(0);
  const [comment, setComment]               = useState("");
  const [submitError, setSubmitError]       = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [deletingId, setDeletingId]         = useState(null);
  const [successMsg, setSuccessMsg]         = useState("");

  /* Fetch reviews for this recipe */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        /* FIX: correct endpoint is /reviews/:recipeId */
        const res = await api.get(`/reviews/${recipeId}`);
        if (res.data.success) setReviews(res.data.reviews);
      } catch (err) {
        console.error("Reviews fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [recipeId]);

  /**
   * Submits a new review.
   */
  const handleSubmit = async () => {
    setSubmitError("");
    setSuccessMsg("");
    if (rating === 0) { setSubmitError("Please select a star rating."); return; }
    if (comment.trim().length < 10) { setSubmitError("Review must be at least 10 characters."); return; }

    setSubmitting(true);
    try {
      const res = await api.post("/reviews", { recipeId, rating, comment });
      if (res.data.success) {
        setReviews((prev) => [res.data.review, ...prev]);
        setRating(0);
        setComment("");
        setSuccessMsg("Review submitted! Thank you.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * NEW: Deletes the current user's review.
   * @param {string} reviewId
   */
  const handleDelete = async (reviewId) => {
    setDeletingId(reviewId);
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error("Delete review error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  /* NEW: Compute average from loaded reviews */
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="reviews-section">
      <h2 className="reviews-heading">Reviews</h2>

      {/* NEW: Rating summary */}
      {!loading && reviews.length > 0 && (
        <div className="reviews-summary">
          <span className="reviews-avg-score">{avgRating}</span>
          <div className="reviews-avg-stars">
            {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
          </div>
          <span className="reviews-count">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Review form for logged-in users */}
      {user ? (
        <div className="review-form">
          <h3>Leave a Review</h3>

          {/* NEW: Interactive hover stars */}
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-btn ${star <= (hoverRating || rating) ? "active" : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >★</button>
            ))}
            {rating > 0 && <span className="rating-label">{["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}</span>}
          </div>

          <div className="review-textarea-wrapper">
            <textarea
              className="review-textarea"
              placeholder="Share your experience with this recipe..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            {/* NEW: Character counter */}
            <span className="review-char-count">{comment.length}/1000</span>
          </div>

          {submitError && <p className="review-error">{submitError}</p>}
          {successMsg  && <p className="review-success">{successMsg}</p>}

          <button className="review-submit-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      ) : (
        /* NEW: Login prompt for guests */
        <div className="review-login-prompt">
          <p>Want to leave a review? <Link to="/login">Log in</Link> or <Link to="/register">create an account</Link>.</p>
        </div>
      )}

      {/* Reviews list */}
      {loading && <p className="reviews-loading">Loading reviews...</p>}
      {!loading && reviews.length === 0 && (
        <p className="reviews-empty">No reviews yet — be the first!</p>
      )}

      <ul className="reviews-list">
        {reviews.map((review) => (
          <li key={review._id} className="review-item">
            <div className="review-header">
              <div className="review-author-info">
                {/* NEW: Avatar initial */}
                <span className="review-avatar">
                  {(review.userId?.name || "A")[0].toUpperCase()}
                </span>
                <span className="review-author">{review.userId?.name || "Anonymous"}</span>
              </div>
              <div className="review-right">
                <span className="review-rating">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </span>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                {/* NEW: Delete button for own reviews */}
                {user && review.userId?._id === user._id && (
                  <button
                    className="review-delete-btn"
                    onClick={() => handleDelete(review._id)}
                    disabled={deletingId === review._id}
                    aria-label="Delete review"
                  >
                    {deletingId === review._id ? "..." : "🗑"}
                  </button>
                )}
              </div>
            </div>
            <p className="review-comment">{review.comment}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ReviewsSection;
