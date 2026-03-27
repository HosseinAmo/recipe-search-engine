/**
 * @file users.js
 * @description User saved-recipe routes.
 * @author Flora
 */

const express = require('express');
const router = express.Router();
const { getSavedRecipes, saveRecipe, unsaveRecipe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/saved', protect, getSavedRecipes);
router.post('/saved', protect, saveRecipe);
router.delete('/saved/:recipeId', protect, unsaveRecipe);

module.exports = router;
