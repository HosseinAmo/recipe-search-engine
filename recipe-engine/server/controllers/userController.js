const User   = require('../models/User');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');

// GET /api/users/saved
async function getSaved(req, res) {
  try {
    const user = await User.findById(req.user._id).populate('savedRecipes');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, recipes: user.savedRecipes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/users/saved  { recipeId }
async function saveRecipe(req, res) {
  try {
    const { recipeId } = req.body;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found.' });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { savedRecipes: recipeId },
    });
    return res.json({ success: true, message: 'Recipe saved.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/users/saved/:recipeId
async function unsaveRecipe(req, res) {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedRecipes: req.params.recipeId },
    });
    return res.json({ success: true, message: 'Recipe removed from saved.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/users/reviews
async function getMyReviews(req, res) {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('recipeId', 'title image cookTime')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getSaved, saveRecipe, unsaveRecipe, getMyReviews };
