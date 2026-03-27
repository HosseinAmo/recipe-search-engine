/**
 * @file userController.js
 * @description Handles saved recipe operations for logged-in users.
 *              Users can save, unsave, and view their bookmarked recipes.
 * @author Flora
 */

const SavedRecipe = require('../models/SavedRecipe');
const Recipe = require('../models/Recipe');

/**
 * @desc    Get all recipes saved by the logged-in user
 * @route   GET /api/users/saved
 * @access  Private
 */
const getSavedRecipes = async (req, res) => {
  try {
    // Find all saved entries for this user, populate full recipe data
    const saved = await SavedRecipe.find({ userId: req.user._id })
      .populate('recipeId')
      .sort({ createdAt: -1 })
      .lean();

    // Extract the populated recipe documents
    const recipes = saved
      .map((s) => s.recipeId)
      .filter(Boolean); // Remove any with deleted recipes

    return res.status(200).json({ success: true, recipes });
  } catch (error) {
    console.error('Get saved recipes error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Save a recipe to the user's collection
 * @route   POST /api/users/saved
 * @access  Private
 */
const saveRecipe = async (req, res) => {
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ success: false, message: 'Recipe ID is required.' });
  }

  try {
    // Verify the recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    // Save it — unique index prevents duplicates
    await SavedRecipe.create({ userId: req.user._id, recipeId });

    return res.status(201).json({ success: true, message: 'Recipe saved.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already saved this recipe.',
      });
    }
    console.error('Save recipe error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Remove a recipe from the user's saved collection
 * @route   DELETE /api/users/saved/:recipeId
 * @access  Private
 */
const unsaveRecipe = async (req, res) => {
  try {
    const result = await SavedRecipe.findOneAndDelete({
      userId: req.user._id,
      recipeId: req.params.recipeId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Saved recipe not found.',
      });
    }

    return res.status(200).json({ success: true, message: 'Recipe removed from saved.' });
  } catch (error) {
    console.error('Unsave recipe error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getSavedRecipes, saveRecipe, unsaveRecipe };
