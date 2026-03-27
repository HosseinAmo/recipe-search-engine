/**
 * @file autocomplete.js
 * @description Route for ingredient autocomplete (EXTRA CREDIT feature).
 * @author Hossein
 */

const express = require('express');
const router = express.Router();
const { getAutocompleteSuggestions } = require('../controllers/autocompleteController');

/**
 * @route   GET /api/autocomplete?q=<query>
 * @desc    Fuzzy ingredient autocomplete with Levenshtein matching
 * @access  Public
 * EXTRA CREDIT
 */
router.get('/', getAutocompleteSuggestions);

module.exports = router;
