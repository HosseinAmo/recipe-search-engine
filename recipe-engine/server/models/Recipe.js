/**
 * @file Recipe.js
 * @description Mongoose schema and model for recipes.
 *              Indexed on ingredients.name for fast autocomplete queries.
 * @author Hossein (schema definition & ingredient index)
 */

const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required.'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Ingredient amount is required.'],
    min: [0, 'Amount cannot be negative.'],
  },
  unit: {
    type: String,
    trim: true,
    default: '',
  },
});

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required.'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters.'],
      maxlength: [100, 'Title cannot exceed 100 characters.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters.'],
    },
    ingredients: {
      type: [ingredientSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one ingredient is required.',
      },
    },
    instructions: {
      type: String,
      required: [true, 'Instructions are required.'],
      trim: true,
    },
    cookTime: {
      type: Number,
      required: [true, 'Cook time is required.'],
      min: [1, 'Cook time must be at least 1 minute.'],
    },
    servings: {
      type: Number,
      required: [true, 'Servings is required.'],
      min: [1, 'Servings must be at least 1.'],
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative.'],
    },
    dietaryTags: {
      type: [String],
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher'],
      default: [],
    },
    image: {
      type: String,
      default: '',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index ingredient names for fast autocomplete aggregation queries
recipeSchema.index({ 'ingredients.name': 1 });

// Text index for full-text search on title and ingredient names
recipeSchema.index({ title: 'text', 'ingredients.name': 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
