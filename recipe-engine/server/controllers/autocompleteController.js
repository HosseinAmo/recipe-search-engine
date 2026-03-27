/**
 * @file autocompleteController.js
 * @description Ingredient autocomplete endpoint with fuzzy/Levenshtein matching.
 *
 * *** EXTRA CREDIT ***
 * This feature goes beyond the assignment brief by implementing fuzzy search
 * using the Levenshtein edit distance algorithm. This allows the API to return
 * suggestions even when the user makes typos (e.g. "tomat" → "tomato",
 * "chiken" → "chicken"). Clearly marked as extra credit per assignment instructions.
 *
 * @author Hossein
 */

const Recipe = require('../models/Recipe');

// ============================================================
// EXTRA CREDIT: Levenshtein Distance Algorithm
// Computes the minimum number of single-character edits
// (insertions, deletions, substitutions) needed to transform
// string a into string b. Used for typo-tolerant autocomplete.
// ============================================================

/**
 * Calculates the Levenshtein edit distance between two strings.
 * @param {string} a - Source string
 * @param {string} b - Target string
 * @returns {number} The edit distance (0 = identical)
 */
const levenshtein = (a, b) => {
  const m = a.length;
  const n = b.length;

  // Build a 2D DP matrix
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // Characters match - no cost
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j],     // Deletion
            dp[i][j - 1],     // Insertion
            dp[i - 1][j - 1]  // Substitution
          );
      }
    }
  }

  return dp[m][n];
};

/**
 * Scores a candidate ingredient against the user's query.
 * Returns a score from 0–1 (higher = better match).
 * Priority: exact prefix match > fuzzy Levenshtein match.
 *
 * @param {string} query - The user's typed input (lowercased)
 * @param {string} candidate - An ingredient name from the DB (lowercased)
 * @returns {number} Score between 0 and 1
 */
const scoreMatch = (query, candidate) => {
  // Exact or prefix match scores highest
  if (candidate.startsWith(query)) return 1;

  // Levenshtein on the first N chars of candidate (same length as query)
  // This makes short queries match the start of longer words fairly
  const slice = candidate.slice(0, query.length + 2);
  const distance = levenshtein(query, slice);

  // Normalise: max allowed distance scales with query length (1 per 4 chars)
  const maxDistance = Math.max(1, Math.floor(query.length / 4));

  if (distance <= maxDistance) {
    // Score inversely proportional to distance
    return 1 - distance / (maxDistance + 1);
  }

  return 0; // Not a useful match
};

/**
 * @desc    Return autocomplete suggestions for a partial ingredient query.
 *          Uses fuzzy Levenshtein matching to tolerate typos.
 * @route   GET /api/autocomplete?q=<query>
 * @access  Public
 *
 * EXTRA CREDIT: fuzzy matching via Levenshtein distance
 */
const getAutocompleteSuggestions = async (req, res) => {
  const { q } = req.query;

  // Require at least 2 characters to avoid returning everything
  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Query must be at least 2 characters.',
    });
  }

  const query = q.trim().toLowerCase();

  try {
    // Pull all distinct ingredient names from the recipes collection.
    // Using MongoDB's $unwind + $group to get a flat unique list.
    const results = await Recipe.aggregate([
      { $unwind: '$ingredients' },
      {
        $group: {
          _id: null,
          names: { $addToSet: { $toLower: '$ingredients.name' } },
        },
      },
      { $project: { _id: 0, names: 1 } },
    ]);

    if (!results.length) {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const allIngredients = results[0].names;

    // Score each ingredient and filter out non-matches
    const scored = allIngredients
      .map((name) => ({ name, score: scoreMatch(query, name) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score) // Best matches first
      .slice(0, 10)                        // Return top 10 suggestions
      .map((item) => item.name);

    return res.status(200).json({
      success: true,
      suggestions: scored,
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

module.exports = { getAutocompleteSuggestions };
