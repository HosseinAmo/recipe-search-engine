/**
 * @file ReviewsSection.jsx
 * @description Reviews section for the recipe detail page.
 *              Scaffold created by Hossein. Full implementation by Anna.
 *              Fetches and displays existing reviews. Logged-in users can submit new ones.
 * @author Hossein (scaffold), Anna (implementation)
 */

import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ReviewsSection.css';

/**
 * ReviewsSection component.
 * @param {object} props
 * @param {string} props.recipeId - The recipe's MongoDB _id
 */
const ReviewsSection = ({ recipeId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews for this recipe on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/${recipeId}`);
        if (res.data.success) setReviews(res.data.reviews);
      } catch (err) {
        console.error('Reviews fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [recipeId]);

  /**
   * Submits a new review for the recipe.
   */
  const handleSubmit = async () => {
    setSubmitError('');
    if (rating === 0) {
      setSubmitError('Please select a star rating.');
      return;
    }
    if (comment.trim().length < 10) {
      setSubmitError('Review must be at least 10 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/reviews', { recipeId, rating, comment });
      if (res.data.success) {
        setReviews((prev) => [res.data.review, ...prev]);
        setRating(0);
        setComment('');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="reviews-section">
      <h2>Reviews</h2>

      {/* Review submission form - only for logged-in users */}
      {user && (
        <div className="review-form">
          <h3>Leave a Review</h3>
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-btn ${star <= rating ? 'active' : ''}`}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="review-textarea"
            placeholder="Write your review here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
          />
          {submitError && <p className="review-error">{submitError}</p>}
          <button
            className="review-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}

      {/* Existing reviews list */}
      {loading && <p>Loading reviews...</p>}
      {!loading && reviews.length === 0 && (
        <p className="reviews-empty">No reviews yet. Be the first!</p>
      )}
      <ul className="reviews-list">
        {reviews.map((review) => (
          <li key={review._id} className="review-item">
            <div className="review-header">
              <span className="review-author">{review.userId?.name || 'Anonymous'}</span>
              <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            </div>
            <p className="review-comment">{review.comment}</p>
            <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ReviewsSection;
