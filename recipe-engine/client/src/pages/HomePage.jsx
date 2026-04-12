/**
 * @file HomePage.jsx
 * @description Landing page with ingredient-based search bar and autocomplete.
 *              Users type ingredients they have and get ranked recipe results.
 * @author Hossein
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./HomePage.css";

/**
 * HomePage component.
 * Renders the main search interface including:
 * - Ingredient tag input with autocomplete dropdown
 * - Dietary filter checkboxes
 * - Search button that navigates to /search with query params
 */
const HomePage = () => {
  const [inputValue, setInputValue] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState([]);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const DIETARY_OPTIONS = [
    "vegetarian",
    "vegan",
    "gluten-free",
    "dairy-free",
    "nut-free",
  ];

  /**
   * Fetches autocomplete suggestions from the API.
   * Debounced to 300ms to reduce unnecessary requests.
   * EXTRA CREDIT: Uses fuzzy Levenshtein matching on the server.
   *
   * @param {string} query - The current input value
   */
  const fetchSuggestions = (query) => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(
          `/autocomplete?q=${encodeURIComponent(query)}`,
        );
        if (res.data.success) {
          setSuggestions(res.data.suggestions);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      }
    }, 300);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  /**
   * Handles typing in the ingredient input.
   * @param {React.ChangeEvent} e
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    fetchSuggestions(value);
  };

  /**
   * Adds an ingredient tag (from suggestion click or Enter key).
   * @param {string} ingredient - The ingredient name to add
   */
  const addIngredient = (ingredient) => {
    const trimmed = ingredient.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
    }
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  /**
   * Removes an ingredient tag.
   * @param {string} ingredient - The ingredient name to remove
   */
  const removeIngredient = (ingredient) => {
    setIngredients((prev) => prev.filter((i) => i !== ingredient));
  };

  /**
   * Handles Enter key to add typed ingredient.
   * @param {React.KeyboardEvent} e
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      addIngredient(inputValue);
    }
  };

  /**
   * Toggles a dietary filter on/off.
   * @param {string} filter
   */
  const toggleFilter = (filter) => {
    setDietaryFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  };

  /**
   * Navigates to the search results page with all query parameters.
   */
  const handleSearch = () => {
    if (ingredients.length === 0) return;

    const params = new URLSearchParams();
    params.set("ingredients", ingredients.join(","));
    if (dietaryFilters.length > 0) {
      params.set("dietary", dietaryFilters.join(","));
    }

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home-page">
      <header className="home-hero">
        <h1 className="home-title">What's in your fridge?</h1>
        <p className="home-subtitle">
          Enter the ingredients you have and we'll find the best recipes for
          you.
        </p>
      </header>

      <section className="search-section">
        {/* Ingredient tag input */}
        <div className="ingredient-input-wrapper">
          <div className="ingredient-tags">
            {ingredients.map((ing) => (
              <span key={ing} className="ingredient-tag">
                {ing}
                <button
                  className="tag-remove"
                  onClick={() => removeIngredient(ing)}
                  aria-label={`Remove ${ing}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              className="ingredient-input"
              placeholder={
                ingredients.length === 0
                  ? "e.g. chicken, garlic, lemon..."
                  : "Add more..."
              }
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              aria-label="Ingredient search input"
              aria-autocomplete="list"
            />
          </div>

          {/* Autocomplete dropdown - EXTRA CREDIT: fuzzy suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="autocomplete-dropdown" role="listbox">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  className="autocomplete-item"
                  role="option"
                  onMouseDown={() => addIngredient(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dietary filter panel */}
        <div className="filter-panel">
          <h3 className="filter-heading">Dietary requirements</h3>
          <div className="filter-checkboxes">
            {DIETARY_OPTIONS.map((option) => (
              <label key={option} className="filter-label">
                <input
                  type="checkbox"
                  checked={dietaryFilters.includes(option)}
                  onChange={() => toggleFilter(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <button
          className="search-button"
          onClick={handleSearch}
          disabled={ingredients.length === 0}
          aria-label="Search for recipes"
        >
          Find Recipes
        </button>
      </section>
    </div>
  );
};

export default HomePage;
