/**
 * @file SavedRecipesPage.jsx
 * @description Displays and manages the current user's saved recipes.
 * @author Flora
 * NEW FEATURES ADDED:
 *  - Fetches saved recipes from API
 *  - Remove saved recipe button
 *  - Empty state with link back to search
 *  - Loading and error states
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import RecipeCard from "../components/RecipeCard";
import "./SavedRecipesPage.css";

/**
 * SavedRecipesPage component.
 * Shows all recipes the logged-in user has saved.
 */
const SavedRecipesPage = () => {
  const [saved, setSaved]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  /* Fetch saved recipes on mount */
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get("/users/saved");
        if (res.data.success) setSaved(res.data.savedRecipes || []);
      } catch (err) {
        console.error("Saved recipes fetch error:", err);
        setError("Failed to load saved recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  /**
   * Removes a recipe from the user's saved list.
   * @param {string} recipeId - MongoDB _id of the recipe
   */
  const handleRemove = async (recipeId) => {
    try {
      await api.delete(`/users/saved/${recipeId}`);
      setSaved((prev) => prev.filter((r) => r._id !== recipeId));
    } catch (err) {
      console.error("Remove saved recipe error:", err);
    }
  };

  if (loading) return <p className="saved-loading">Loading saved recipes...</p>;
  if (error)   return <p className="saved-error">{error}</p>;

  return (
    <div className="saved-page">
      <div className="saved-header">
        <h1 className="saved-title">♥ Saved Recipes</h1>
        <p className="saved-count">
          {saved.length === 0 ? "No saved recipes yet" : `${saved.length} recipe${saved.length !== 1 ? "s" : ""} saved`}
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="saved-empty">
          <p className="saved-empty-text">You haven't saved any recipes yet.</p>
          <Link to="/" className="saved-explore-btn">🔍 Find Recipes</Link>
        </div>
      ) : (
        <div className="saved-grid">
          {saved.map((recipe) => (
            <div key={recipe._id} className="saved-card-wrapper">
              <RecipeCard recipe={recipe} />
              <button
                className="saved-remove-btn"
                onClick={() => handleRemove(recipe._id)}
                aria-label="Remove from saved"
              >
                ✕ Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedRecipesPage;
