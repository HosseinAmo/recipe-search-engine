/**
 * @file ProfilePage.jsx
 * @description User profile page showing account info, stats, and settings.
 * @author Flora
 * NEW FEATURES ADDED:
 *  - Shows user role badge (admin/user)
 *  - Quick stats: saved recipes count
 *  - Link to saved recipes
 *  - Logout button
 *  - Account created date
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "./ProfilePage.css";

/**
 * ProfilePage component.
 * Displays the logged-in user's profile and account info.
 */
const ProfilePage = () => {
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();
  const [savedCount, setSavedCount] = useState(0);
  const [myReviews, setMyReviews]   = useState([]);
  const [loading, setLoading]     = useState(true);

  /* Fetch saved count for stats */
  useEffect(() => {
    const fetchStats = async () => {
  try {
    const savedRes = await api.get("/users/saved");
    if (savedRes.data.success) setSavedCount((savedRes.data.recipes || []).length);

    const reviewsRes = await api.get("/users/reviews");
    if (reviewsRes.data.success) setMyReviews(reviewsRes.data.reviews || []);
  } catch (err) {
    console.error("Profile stats error:", err);
  } finally {
    setLoading(false);
  }
};
    fetchStats();
  }, []);

  /**
   * Logs the user out and redirects to home.
   */
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const avatarLetter = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="profile-page">
      <Link to="/" className="profile-back-link">← Back to search</Link>
      {/* Avatar + name */}
      <div className="profile-hero">
        <div className="profile-avatar">{avatarLetter}</div>
        <div className="profile-hero-info">
          <h1 className="profile-name">{user?.name}</h1>
          <p className="profile-email">{user?.email}</p>
          {/* NEW: Role badge */}
          {user?.role === "admin" && (
  <span className="profile-role-badge admin">
    👑 Admin
  </span>
)}
        </div>
      </div>

      {/* NEW: Stats */}
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-value">{loading ? "..." : savedCount}</span>
          <span className="profile-stat-label">Saved Recipes</span>
        </div>
      </div>

      {/* Info card */}
      <div className="profile-card">
        <h2 className="profile-card-title">Account Information</h2>
        <div className="profile-field">
          <span className="profile-field-label">Name</span>
          <span className="profile-field-value">{user?.name}</span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Email</span>
          <span className="profile-field-value">{user?.email}</span>
        </div>
        {user?.role === "admin" && (
          <div className="profile-field">
            <span className="profile-field-label">Role</span>
            <span className="profile-field-value">{user?.role}</span>
          </div>
        )}
      </div>

      <div className="profile-card">
        <h2 className="profile-card-title">My Reviews</h2>

        {myReviews.length === 0 ? (
          <p className="profile-empty-text">You haven't reviewed any recipes yet.</p>
        ) : (
          <div className="profile-reviews-list">
            {myReviews.map((review) => (
              <div key={review._id} className="profile-review-item">
                <Link to={`/recipes/${review.recipeId?._id}`} className="profile-review-title">
                  {review.recipeId?.title || "Recipe removed"}
                </Link>

                <div className="profile-review-rating">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </div>

                <p className="profile-review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="profile-actions">
        <Link to="/saved" className="profile-saved-link">♥ View Saved Recipes</Link>
        <button className="profile-logout-btn" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
};

export default ProfilePage;
