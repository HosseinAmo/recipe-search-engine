/**
 * @file Review.js
 * @description Mongoose schema for user reviews on recipes.
 *              Each user can only leave one review per recipe.
 * @author Anna
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'Recipe ID is required.'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required.'],
    },
    rating: {
      type: Number,
      required: [true, 'A star rating is required.'],
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating cannot exceed 5.'],
    },
    comment: {
      type: String,
      required: [true, 'Review text is required.'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters.'],
      maxlength: [1000, 'Review cannot exceed 1000 characters.'],
    },
  },
  { timestamps: true }
);

// One review per user per recipe
reviewSchema.index({ recipeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
