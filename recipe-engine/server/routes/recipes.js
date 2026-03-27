/**
 * @file recipes.js
 * @description Recipe routes: search, CRUD.
 * @author Dylan (search + ranking), Hossein (auth middleware wiring)
 */

const express = require('express');
const router = express.Router();
const {
  searchRecipes,
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require('../controllers/recipeController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validateRecipe } = require('../middleware/validateMiddleware');

router.get('/search', searchRecipes);
router.get('/', getAllRecipes);
router.get('/:id', optionalAuth, getRecipeById);
router.post('/', protect, validateRecipe, createRecipe);
router.put('/:id', protect, validateRecipe, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

module.exports = router;
