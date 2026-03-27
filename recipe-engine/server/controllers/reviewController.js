/**
 * @file reviewController.js
 * @description Handles creating and retrieving reviews for recipes.
 *              When a review is created, the recipe's averageRating and
 *              reviewCount are recomputed and updated automatically.
 * @author Anna
 */

const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const Recipe = require('../models/Recipe');

/**
 * Recomputes and saves the average rating and review count on a recipe document.
 * Called after every new review submission.
 *
 * @param {string} recipeId - MongoDB _id of the recipe to update
 */
const updateRecipeRating = async (recipeId) => {
  const stats = await Review.aggregate([
    { $match: { recipeId: recipeId } },
    {
      $group: {
        _id: '$recipeId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    // No reviews left — reset to defaults
    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

/**
 * @desc    Get all reviews for a specific recipe
 * @route   GET /api/reviews/:recipeId
 * @access  Public
 */
const getReviewsByRecipe = async (req, res) => {
  try {
    const reviews = await Review.find({ recipeId: req.params.recipeId })
      .populate('userId', 'name') // Include reviewer's name only
      .sort({ createdAt: -1 })    // Newest first
      .lean();

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Submit a new review for a recipe
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { recipeId, rating, comment } = req.body;

  try {
    // Check the recipe actually exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    // Create the review (unique index prevents duplicate user+recipe combos)
    const review = await Review.create({
      recipeId,
      userId: req.user._id,
      rating,
      comment,
    });

    // Populate the user name for the response
    await review.populate('userId', 'name');

    // Recompute recipe's average rating
    await updateRecipeRating(recipe._id);

    return res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this recipe.',
      });
    }
    console.error('Create review error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Delete a review (only the author can delete their own review)
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews.',
      });
    }

    const recipeId = review.recipeId;
    await review.deleteOne();

    // Recompute rating after deletion
    await updateRecipeRating(recipeId);

    return res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getReviewsByRecipe, createReview, deleteReview };
