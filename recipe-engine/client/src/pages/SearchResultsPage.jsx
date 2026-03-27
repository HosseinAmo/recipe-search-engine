/**
 * @file SearchResultsPage.jsx
 * @description Displays ranked recipe results based on ingredient query.
 *              Reads search params from URL and fetches matching recipes.
 *              Includes filter panel for dietary tags, cook time, calories.
 * @author Hossein
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import FilterPanel from '../components/FilterPanel';
import './SearchResultsPage.css';

/**
 * SearchResultsPage component.
 * Fetches and renders recipe results from the search API.
 * Supports re-filtering via the sidebar FilterPanel.
 */
const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Parse query params from URL
  const ingredientList = searchParams.get('ingredients') || '';
  const dietaryParam = searchParams.get('dietary') || '';
  const cookTimeMax = searchParams.get('cookTimeMax') || '';
  const caloriesMax = searchParams.get('caloriesMax') || '';

  /**
   * Fetches recipes from the API whenever URL params change.
   */
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/recipes/search', {
          params: {
            ingredients: ingredientList,
            dietary: dietaryParam,
            cookTimeMax,
            caloriesMax,
          },
        });
        if (res.data.success) {
          setRecipes(res.data.recipes);
        } else {
          setError('No recipes found. Try different ingredients.');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (ingredientList) {
      fetchRecipes();
    }
  }, [ingredientList, dietaryParam, cookTimeMax, caloriesMax]);

  /**
   * Updates the URL search params when a filter changes.
   * @param {object} updatedFilters - New filter key/value pairs
   */
  const handleFilterChange = (updatedFilters) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, ...updatedFilters });
  };

  const ingredientTags = ingredientList.split(',').filter(Boolean);

  return (
    <div className="results-page">
      <aside className="results-sidebar">
        <FilterPanel
          initialDietary={dietaryParam.split(',').filter(Boolean)}
          initialCookTimeMax={cookTimeMax}
          initialCaloriesMax={caloriesMax}
          onFilterChange={handleFilterChange}
        />
      </aside>

      <section className="results-main">
        <div className="results-header">
          <h2 className="results-title">
            Recipes using:{' '}
            <span className="results-ingredients">
              {ingredientTags.join(', ')}
            </span>
          </h2>
          {!loading && (
            <p className="results-count">
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {loading && <p className="results-loading">Searching recipes...</p>}

        {error && <p className="results-error">{error}</p>}

        {!loading && !error && recipes.length === 0 && (
          <div className="results-empty">
            <p>No recipes found for those ingredients.</p>
            <Link to="/" className="results-back-link">Try a new search</Link>
          </div>
        )}

        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default SearchResultsPage;
