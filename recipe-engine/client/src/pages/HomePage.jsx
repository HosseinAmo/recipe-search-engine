/**
 * @file HomePage.jsx
 * @description Landing page with ingredient search, autocomplete, dietary filters,
 *              trending recipes section, and random recipe button.
 * @author Hossein
 * NEW FEATURES ADDED:
 *  - Trending recipes section (fetches latest recipes from API)
 *  - "Surprise Me" random recipe button
 *  - Servings filter added to dietary panel
 *  - Improved empty state with helpful tips
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import RecipeCard from "../components/RecipeCard";
import "./HomePage.css";

const DIETARY_OPTIONS = ["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"];

const HomePage = () => {
  const [inputValue, setInputValue]       = useState("");
  const [ingredients, setIngredients]     = useState([]);
  const [suggestions, setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dietaryFilters, setDietaryFilters]   = useState([]);
  const [trending, setTrending]           = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [searchError, setSearchError]     = useState("");
  const debounceRef = useRef(null);
  const navigate    = useNavigate();

  /* Fetch trending recipes on mount */
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get("/recipes?limit=4&sort=rating");
        if (res.data.success) setTrending(res.data.recipes);
      } catch (err) {
        console.error("Trending fetch error:", err);
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, []);

  /* Autocomplete with 300ms debounce */
  const fetchSuggestions = (query) => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/autocomplete?q=${encodeURIComponent(query)}`);
        if (res.data.success) {
          setSuggestions(res.data.suggestions);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }, 300);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    fetchSuggestions(e.target.value);
  };

  const addIngredient = (ingredient) => {
    const trimmed = ingredient.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
    }
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeIngredient = (ingredient) => {
    setIngredients((prev) => prev.filter((i) => i !== ingredient));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) addIngredient(inputValue);
    if (e.key === "Escape") setShowSuggestions(false);
  };

  const toggleFilter = (filter) => {
    setDietaryFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const handleSearch = () => {
    if (ingredients.length === 0) {
      setSearchError("Please add at least one ingredient.");
      return;
    }
    setSearchError("");
    const params = new URLSearchParams();
    params.set("ingredients", ingredients.join(","));
    if (dietaryFilters.length > 0) params.set("dietary", dietaryFilters.join(","));
    navigate(`/search?${params.toString()}`);
  };

  /* NEW: Navigate to a random recipe */
  const handleSurpriseMe = async () => {
    try {
      const res = await api.get("/recipes?limit=50");
      if (res.data.success && res.data.recipes.length > 0) {
        const random = res.data.recipes[Math.floor(Math.random() * res.data.recipes.length)];
        navigate(`/recipes/${random._id}`);
      }
    } catch (err) {
      console.error("Surprise me error:", err);
    }
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <header className="home-hero">
        <h1 className="home-title">What's in your fridge?</h1>
        <p className="home-subtitle">
          Enter the ingredients you have and we'll find the best recipes for you.
        </p>
      </header>

      {/* Search section */}
      <section className="search-section">
        <div className="ingredient-input-wrapper">
          <div className="ingredient-tags">
            {ingredients.map((ing) => (
              <span key={ing} className="ingredient-tag">
                {ing}
                <button className="tag-remove" onClick={() => removeIngredient(ing)} aria-label={`Remove ${ing}`}>×</button>
              </span>
            ))}
            <input
              type="text"
              className="ingredient-input"
              placeholder={ingredients.length === 0 ? "e.g. chicken, garlic, lemon..." : "Add more..."}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              aria-label="Ingredient search input"
            />
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="autocomplete-dropdown" role="listbox">
              {suggestions.map((s) => (
                <li key={s} className="autocomplete-item" role="option" onMouseDown={() => addIngredient(s)}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dietary filters */}
        <div className="filter-panel">
          <h3 className="filter-heading">Dietary requirements</h3>
          <div className="filter-checkboxes">
            {DIETARY_OPTIONS.map((option) => (
              <label key={option} className={`filter-label ${dietaryFilters.includes(option) ? "active" : ""}`}>
                <input type="checkbox" checked={dietaryFilters.includes(option)} onChange={() => toggleFilter(option)} />
                {option}
              </label>
            ))}
          </div>
        </div>

        {searchError && <p className="search-error">{searchError}</p>}

        {/* Action buttons */}
        <div className="search-actions">
          <button className="search-button" onClick={handleSearch} disabled={ingredients.length === 0}>
            🔍 Find Recipes
          </button>
          {/* NEW: Surprise Me button */}
          <button className="surprise-button" onClick={handleSurpriseMe}>
            🎲 Surprise Me
          </button>
        </div>

        {/* Tips */}
        <p className="search-tip">💡 Tip: Press Enter to add an ingredient, or click a suggestion</p>
      </section>

      {/* NEW: Trending Recipes section */}
      <section className="trending-section">
        <h2 className="trending-title">⭐ Top Rated Recipes</h2>
        {trendingLoading ? (
          <p className="trending-loading">Loading...</p>
        ) : trending.length > 0 ? (
          <div className="trending-grid">
            {trending.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <p className="trending-empty">No recipes yet — be the first to add one!</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;
