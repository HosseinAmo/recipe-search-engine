/**
 * @file recipeController.js
 * @description Full CRUD controller for recipes plus the ingredient-based
 *              search and ranking algorithm. Recipes are ranked by:
 *              1. Ingredient match score (overlap / total recipe ingredients)
 *              2. Cook time (shorter scores higher)
 *              3. Average rating
 * @author Dylan (search + ranking algorithm), Hossein (auth wiring + validation)
 */

const { validationResult } = require('express-validator');
const Recipe = require('../models/Recipe');
const SavedRecipe = require('../models/SavedRecipe');

/**
 * Computes an ingredient match score between the user's ingredient list
 * and a recipe's ingredient list.
 * Score = matched ingredients / total recipe ingredients (0–1).
 *
 * @param {string[]} userIngredients - Array of lowercased ingredient names from the user
 * @param {object[]} recipeIngredients - Array of ingredient objects from the recipe
 * @returns {number} Score between 0 and 1
 */
const computeMatchScore = (userIngredients, recipeIngredients) => {
  if (!recipeIngredients || recipeIngredients.length === 0) return 0;

  const recipeNames = recipeIngredients.map((i) => i.name.toLowerCase());

  // Count how many recipe ingredients appear in the user's list
  const matched = recipeNames.filter((name) =>
    userIngredients.some((ui) => name.includes(ui) || ui.includes(name))
  ).length;

  return matched / recipeNames.length;
};

/**
 * @desc    Search and rank recipes by ingredients + optional filters
 * @route   GET /api/recipes/search
 * @access  Public
 * @query   ingredients - comma-separated list of ingredients the user has
 * @query   dietary     - comma-separated dietary tags to filter by
 * @query   cookTimeMax - maximum cook time in minutes
 * @query   caloriesMax - maximum calories per serving
 */
const searchRecipes = async (req, res) => {
  const { ingredients, dietary, cookTimeMax, caloriesMax } = req.query;

  if (!ingredients || ingredients.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least one ingredient.',
    });
  }

  // Parse user ingredients into a clean lowercase array
  const userIngredients = ingredients
    .split(',')
    .map((i) => i.trim().toLowerCase())
    .filter(Boolean);

  try {
    // Build MongoDB filter object
    const filter = {};

    // Filter by dietary tags (recipe must include ALL requested tags)
    if (dietary && dietary.trim()) {
      const dietaryList = dietary.split(',').map((d) => d.trim()).filter(Boolean);
      if (dietaryList.length > 0) {
        filter.dietaryTags = { $all: dietaryList };
      }
    }

    // Filter by maximum cook time
    if (cookTimeMax && !isNaN(cookTimeMax)) {
      filter.cookTime = { $lte: parseInt(cookTimeMax, 10) };
    }

    // Filter by maximum calories
    if (caloriesMax && !isNaN(caloriesMax)) {
      filter.calories = { $lte: parseInt(caloriesMax, 10) };
    }

    // Fetch all recipes matching the structural filters
    const recipes = await Recipe.find(filter).lean();

    // Score and sort recipes by ingredient match
    const scored = recipes
      .map((recipe) => ({
        ...recipe,
        matchScore: computeMatchScore(userIngredients, recipe.ingredients),
      }))
      .filter((r) => r.matchScore > 0) // Only show recipes with at least one match
      .sort((a, b) => {
        // Primary: ingredient match score (descending)
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        // Secondary: cook time (ascending — quicker recipes rank higher)
        if (a.cookTime !== b.cookTime) return a.cookTime - b.cookTime;
        // Tertiary: average rating (descending)
        return b.averageRating - a.averageRating;
      });

    return res.status(200).json({
      success: true,
      count: scored.length,
      recipes: scored,
    });
  } catch (error) {
    console.error('Search recipes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
};

/**
 * @desc    Get all recipes (paginated)
 * @route   GET /api/recipes
 * @access  Public
 */
const getAllRecipes = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  try {
    const [recipes, total] = await Promise.all([
      Recipe.find().skip(skip).limit(limit).lean(),
      Recipe.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      recipes,
    });
  } catch (error) {
    console.error('Get all recipes error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Get a single recipe by ID.
 *          Also returns isSaved flag if a user is logged in.
 * @route   GET /api/recipes/:id
 * @access  Public
 */
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).lean();

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    // Check if the logged-in user has saved this recipe
    let isSaved = false;
    if (req.user) {
      const saved = await SavedRecipe.findOne({
        userId: req.user._id,
        recipeId: req.params.id,
      });
      isSaved = !!saved;
    }

    return res.status(200).json({ success: true, recipe, isSaved });
  } catch (error) {
    console.error('Get recipe by ID error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Create a new recipe
 * @route   POST /api/recipes
 * @access  Private
 */
const createRecipe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const recipe = await Recipe.create({
      ...req.body,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, recipe });
  } catch (error) {
    console.error('Create recipe error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Update an existing recipe (only the creator can update)
 * @route   PUT /api/recipes/:id
 * @access  Private
 */
const updateRecipe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    // Only the creator can update their recipe
    if (recipe.createdBy && recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to edit this recipe.',
      });
    }

    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, recipe: updated });
  } catch (error) {
    console.error('Update recipe error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Delete a recipe (only the creator can delete)
 * @route   DELETE /api/recipes/:id
 * @access  Private
 */
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    if (recipe.createdBy && recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to delete this recipe.',
      });
    }

    await recipe.deleteOne();

    return res.status(200).json({ success: true, message: 'Recipe deleted.' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  searchRecipes,
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
