/**
 * @file SavedRecipe.js
 * @description Mongoose schema for user-saved (bookmarked) recipes.
 *              Each user can save a recipe once; duplicates are rejected by the unique index.
 * @author Flora
 */

const mongoose = require('mongoose');

const savedRecipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent a user from saving the same recipe twice
savedRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('SavedRecipe', savedRecipeSchema);
