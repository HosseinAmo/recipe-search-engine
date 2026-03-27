/**
 * @file RecipeCard.jsx
 * @description Reusable recipe card for search results grid.
 *              Shows title, image, cook time, rating, and dietary tags.
 * @author Hossein
 */

import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import './RecipeCard.css';

/**
 * RecipeCard component.
 * @param {object} props
 * @param {object} props.recipe - Recipe document from the API
 */
const RecipeCard = ({ recipe }) => {
  return (
    <Link to={`/recipes/${recipe._id}`} className="recipe-card">
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} className="recipe-card-image" />
      )}
      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <div className="recipe-card-stats">
          <span>⏱ {recipe.cookTime} min</span>
          <span>🍽 {recipe.servings} servings</span>
        </div>
        <StarRating rating={recipe.averageRating} reviewCount={recipe.reviewCount} />
        {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
          <div className="recipe-card-tags">
            {recipe.dietaryTags.map((tag) => (
              <span key={tag} className="recipe-card-tag">{tag}</span>
            ))}
          </div>
        )}
        {recipe.matchScore !== undefined && (
          <p className="recipe-card-match">
            {Math.round(recipe.matchScore * 100)}% ingredient match
          </p>
        )}
      </div>
    </Link>
  );
};

export default RecipeCard;
