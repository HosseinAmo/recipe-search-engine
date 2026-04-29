const Review = require("../models/Review");
const Recipe = require("../models/Recipe");

// GET /api/reviews/:recipeId
async function getReviews(req, res) {
  try {
    const reviews = await Review.find({ recipeId: req.params.recipeId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/reviews
async function createReview(req, res) {
  try {
    const { recipeId, rating, comment } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found." });
    }

    let review = await Review.findOne({ recipeId, userId: req.user._id });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        recipeId,
        userId: req.user._id,
        rating,
        comment,
      });
    }

    const allReviews = await Review.find({ recipeId });
    const avg =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("userId", "name")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Review submitted.",
      review: populatedReview,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/reviews/:reviewId
async function deleteReview(req, res) {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorised." });
    }

    const recipeId = review.recipeId;

    await review.deleteOne();

    const allReviews = await Review.find({ recipeId });

    const updateData = {
      reviewCount: allReviews.length,
      averageRating: 0,
    };

    if (allReviews.length > 0) {
      const avg =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      updateData.averageRating = Math.round(avg * 10) / 10;
    }

    await Recipe.findByIdAndUpdate(recipeId, updateData);

    return res.json({ success: true, message: "Review deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getReviews, createReview, deleteReview };
