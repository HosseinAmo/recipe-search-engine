const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    unit: { type: String, default: "" },
  },
  { _id: false },
);

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    ingredients: [ingredientSchema],
    instructions: { type: String, required: true },
    cookTime: { type: Number, required: true }, // minutes
    servings: { type: Number, required: true },
    calories: { type: Number, default: null },
    dietaryTags: [{ type: String, trim: true }],
    image: { type: String, default: null },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Text index for search
recipeSchema.index({ title: "text", "ingredients.name": "text" });

module.exports = mongoose.model("Recipe", recipeSchema);
