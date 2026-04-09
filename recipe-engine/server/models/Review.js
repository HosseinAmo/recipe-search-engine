const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 10, maxlength: 1000 },
  },
  { timestamps: true },
);

// One review per user per recipe
reviewSchema.index({ recipeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
