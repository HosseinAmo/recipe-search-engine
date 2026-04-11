/**
 * @file autocompleteController.js
 * @description Controller for ingredient autocomplete with fuzzy/Levenshtein matching.
 * @author Hossein
 */

const Recipe = require('../models/Recipe');

/**
 * Computes the Levenshtein edit distance between two strings.
 * Used for typo-tolerant fuzzy matching (e.g. "chiken" → "chicken").
 * @param {string} a - Source string
 * @param {string} b - Target string
 * @returns {number} Edit distance (lower = more similar)
 */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  // Build a (m+1) x (n+1) matrix of edit distances
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * GET /api/autocomplete?q=<query>
 * Returns up to 8 ingredient suggestions matching the query.
 * Matches by substring first; falls back to Levenshtein for short queries.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function getAutocomplete(req, res) {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    // Fetch all recipes containing ingredients whose name matches the query (case-insensitive)
    const recipes = await Recipe.find(
      { 'ingredients.name': { $regex: q, $options: 'i' } },
      { 'ingredients.name': 1 }
    ).lean();

    // Collect unique ingredient names that contain the substring
    const exactMatches = new Set();
    const allIngredients = new Set();

    for (const recipe of recipes) {
      for (const ing of recipe.ingredients) {
        const name = ing.name.toLowerCase();
        allIngredients.add(name);
        if (name.includes(q)) {
          exactMatches.add(name);
        }
      }
    }

    // Fuzzy fallback: find ingredients within edit distance 2 of the query
    // (catches typos like "chiken" → "chicken", "tomatoe" → "tomato")
    const fuzzyMatches = new Set();
    const maxDist = q.length <= 4 ? 1 : 2; // stricter tolerance for short queries
    for (const name of allIngredients) {
      if (exactMatches.has(name)) continue;
      // Only check words within the ingredient name, not the full string
      const words = name.split(/\s+/);
      for (const word of words) {
        if (Math.abs(word.length - q.length) <= maxDist) {
          if (levenshtein(q, word) <= maxDist) {
            fuzzyMatches.add(name);
            break;
          }
        }
      }
    }

    // Combine: exact substring matches first, then fuzzy matches
    const suggestions = [
      ...[...exactMatches].sort(),
      ...[...fuzzyMatches].sort(),
    ].slice(0, 8);

    return res.json({ success: true, suggestions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAutocomplete };
