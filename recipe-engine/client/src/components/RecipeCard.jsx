/**
 * @file RecipeCard.jsx
 * @description Reusable recipe card for search results and trending grids.
 * @author Hossein
 * NEW FEATURES ADDED:
 *  - Calories display
 *  - Ingredient match percentage bar
 *  - Fallback placeholder image when no image available
 */

import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import "./RecipeCard.css";

/**
 * RecipeCard component.
 * @param {object} props
 * @param {object} props.recipe - Recipe document from the API
 */
const RecipeCard = ({ recipe }) => {
  return (
    <Link to={`/recipes/${recipe._id}`} className="recipe-card">
      {/* Image or placeholder */}
      {recipe.image ? (
        <img src={recipe.image} alt={recipe.title} className="recipe-card-image" />
      ) : (
        <div className="recipe-card-placeholder">🍽</div>
      )}

      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.title}</h3>

        <div className="recipe-card-stats">
          <span>⏱ {recipe.cookTime} min</span>
          <span>🍽 {recipe.servings} servings</span>
          {/* NEW: Calories */}
          {recipe.calories && <span>🔥 {recipe.calories} kcal</span>}
        </div>

        <StarRating rating={recipe.averageRating} reviewCount={recipe.reviewCount} />

        {/* Dietary tags */}
        {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
          <div className="recipe-card-tags">
            {recipe.dietaryTags.slice(0, 3).map((tag) => (
              <span key={tag} className="recipe-card-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* NEW: Ingredient match bar */}
        {recipe.matchScore !== undefined && (
          <div className="recipe-card-match">
            <div className="match-bar">
              <div className="match-bar-fill" style={{ width: `${Math.round(recipe.matchScore * 100)}%` }} />
            </div>
            <span className="match-label">{Math.round(recipe.matchScore * 100)}% match</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default RecipeCard;
