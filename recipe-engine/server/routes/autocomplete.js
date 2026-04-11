/**
 * @file autocomplete.js
 * @description Routes for ingredient autocomplete (fuzzy + substring matching).
 * @author Hossein
 */

const router = require('express').Router();
const { getAutocomplete } = require('../controllers/autocompleteController');

// GET /api/autocomplete?q=chick
router.get('/', getAutocomplete);

module.exports = router;
