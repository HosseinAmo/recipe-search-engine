/**
 * @file RecipeDetailPage.jsx
 * @description Full recipe detail view: ingredients, instructions, ratings summary.
 *              Logged-in users can save/unsave the recipe and view reviews.
 * @author Hossein (page structure, save/unsave logic)
 *         Anna (reviews section - see ReviewsSection component)
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import ReviewsSection from "../components/ReviewsSection";
import "./RecipeDetailPage.css";

/**
 * RecipeDetailPage component.
 * Fetches a single recipe by ID and renders all its details.
 */
const RecipeDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch recipe data on mount
  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/recipes/${id}`);
        if (res.data.success) {
          setRecipe(res.data.recipe);
          setSaved(res.data.isSaved || false);
        } else {
          setError("Recipe not found.");
        }
      } catch (err) {
        console.error("Recipe fetch error:", err);
        setError("Failed to load recipe. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  /**
   * Toggles the saved/unsaved state for the current user.
   * POST to save, DELETE to unsave.
   */
  const handleSaveToggle = async () => {
    if (!user) return;
    setSaveLoading(true);
    try {
      if (saved) {
        await api.delete(`/users/saved/${id}`);
        setSaved(false);
      } else {
        await api.post("/users/saved", { recipeId: id });
        setSaved(true);
      }
    } catch (err) {
      console.error("Save toggle error:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <p className="detail-loading">Loading recipe...</p>;
  if (error) return <p className="detail-error">{error}</p>;
  if (!recipe) return null;

  return (
    <div className="detail-page">
      {/* Back link */}
      <Link to="/" className="detail-back">
        ← Back to search
      </Link>

      <article className="detail-article">
        {/* Header */}
        <header className="detail-header">
          {recipe.image && (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="detail-image"
            />
          )}
          <div className="detail-meta">
            <h1 className="detail-title">{recipe.title}</h1>
            <div className="detail-stats">
              <span>⏱ {recipe.cookTime} min</span>
              <span>🍽 {recipe.servings} servings</span>
              {recipe.calories && <span>🔥 {recipe.calories} kcal</span>}
            </div>
            <StarRating
              rating={recipe.averageRating}
              reviewCount={recipe.reviewCount}
            />

            {/* Dietary tags */}
            {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
              <div className="detail-tags">
                {recipe.dietaryTags.map((tag) => (
                  <span key={tag} className="detail-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Save / Unsave button (only for logged-in users) */}
            {user && (
              <button
                className={`save-button ${saved ? "saved" : ""}`}
                onClick={handleSaveToggle}
                disabled={saveLoading}
                aria-label={saved ? "Remove from saved recipes" : "Save recipe"}
              >
                {saved ? "♥ Saved" : "♡ Save Recipe"}
              </button>
            )}
          </div>
        </header>

        {/* Ingredients */}
        <section className="detail-section">
          <h2>Ingredients</h2>
          <ul className="detail-ingredients">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                {ing.amount} {ing.unit} {ing.name}
              </li>
            ))}
          </ul>
        </section>

        {/* Instructions */}
        <section className="detail-section">
          <h2>Instructions</h2>
          <p className="detail-instructions">{recipe.instructions}</p>
        </section>

        {/* Reviews - Anna's section */}
        <ReviewsSection recipeId={id} />
      </article>
    </div>
  );
};

export default RecipeDetailPage;
