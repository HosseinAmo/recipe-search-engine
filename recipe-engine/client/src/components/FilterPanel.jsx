/**
 * @file FilterPanel.jsx
 * @description Sidebar filter panel for search results.
 *              Allows filtering by dietary tags, max cook time, and max calories.
 * @author Hossein
 */

import { useState } from 'react';
import './FilterPanel.css';

const DIETARY_OPTIONS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free',
];

/**
 * FilterPanel component.
 * Renders checkbox filters for dietary requirements and range inputs
 * for cook time and calories. Calls onFilterChange when applied.
 *
 * @param {object} props
 * @param {string[]} props.initialDietary - Currently active dietary filters
 * @param {string} props.initialCookTimeMax - Current max cook time filter
 * @param {string} props.initialCaloriesMax - Current max calories filter
 * @param {function} props.onFilterChange - Callback with updated filter object
 */
const FilterPanel = ({
  initialDietary = [],
  initialCookTimeMax = '',
  initialCaloriesMax = '',
  onFilterChange,
}) => {
  const [dietary, setDietary] = useState(initialDietary);
  const [cookTimeMax, setCookTimeMax] = useState(initialCookTimeMax);
  const [caloriesMax, setCaloriesMax] = useState(initialCaloriesMax);

  /**
   * Toggles a dietary filter checkbox.
   * @param {string} option
   */
  const toggleDietary = (option) => {
    setDietary((prev) =>
      prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option]
    );
  };

  /**
   * Applies the current filters by calling the parent callback.
   */
  const applyFilters = () => {
    onFilterChange({
      dietary: dietary.join(','),
      cookTimeMax,
      caloriesMax,
    });
  };

  /**
   * Resets all filters to their default (empty) state.
   */
  const resetFilters = () => {
    setDietary([]);
    setCookTimeMax('');
    setCaloriesMax('');
    onFilterChange({ dietary: '', cookTimeMax: '', caloriesMax: '' });
  };

  return (
    <div className="filter-panel">
      <h3 className="filter-heading">Filter Results</h3>

      {/* Dietary tags */}
      <fieldset className="filter-group">
        <legend className="filter-label-heading">Dietary</legend>
        {DIETARY_OPTIONS.map((option) => (
          <label key={option} className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={dietary.includes(option)}
              onChange={() => toggleDietary(option)}
            />
            {option}
          </label>
        ))}
      </fieldset>

      {/* Max cook time */}
      <div className="filter-group">
        <label className="filter-label-heading" htmlFor="cookTimeMax">
          Max cook time (minutes)
        </label>
        <input
          id="cookTimeMax"
          type="number"
          className="filter-input"
          min="1"
          max="300"
          placeholder="e.g. 30"
          value={cookTimeMax}
          onChange={(e) => setCookTimeMax(e.target.value)}
        />
      </div>

      {/* Max calories */}
      <div className="filter-group">
        <label className="filter-label-heading" htmlFor="caloriesMax">
          Max calories
        </label>
        <input
          id="caloriesMax"
          type="number"
          className="filter-input"
          min="1"
          placeholder="e.g. 600"
          value={caloriesMax}
          onChange={(e) => setCaloriesMax(e.target.value)}
        />
      </div>

      <div className="filter-actions">
        <button className="filter-apply-btn" onClick={applyFilters}>
          Apply Filters
        </button>
        <button className="filter-reset-btn" onClick={resetFilters}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
