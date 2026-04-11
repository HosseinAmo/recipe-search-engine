const Review = require('../models/Review');
const Recipe = require('../models/Recipe');

// GET /api/reviews/:recipeId
async function getReviews(req, res) {
  try {
    const reviews = await Review.find({ recipeId: req.params.recipeId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/reviews  { recipeId, rating, comment }
async function createReview(req, res) {
  try {
    const { recipeId, rating, comment } = req.body;

    // Check recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found.' });

    // Upsert: replace existing review by same user for same recipe
    const existing = await Review.findOne({ recipeId, userId: req.user._id });
    if (existing) {
      existing.rating  = rating;
      existing.comment = comment;
      await existing.save();
    } else {
      await Review.create({ recipeId, userId: req.user._id, rating, comment });
    }

    // Recalculate averageRating and reviewCount on the Recipe
    const allReviews = await Review.find({ recipeId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating: Math.round(avg * 10) / 10,
      reviewCount:   allReviews.length,
    });

    return res.status(201).json({ success: true, message: 'Review submitted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getReviews, createReview };
