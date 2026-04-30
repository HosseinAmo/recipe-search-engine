const router = require("express").Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getReviews,
  createReview,
  deleteReview,
} = require("../controllers/reviewController");

router.get("/:recipeId", getReviews);
router.post("/", protect, createReview);
router.delete("/:reviewId", protect, deleteReview);
module.exports = router;
