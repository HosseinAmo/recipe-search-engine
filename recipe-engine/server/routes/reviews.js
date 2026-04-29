const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const {
  getReviews,
  createReview,
  deleteReview,
} = require("../controllers/reviewController");

router.get("/:recipeId", getReviews);
router.post("/", requireAuth, createReview);
router.delete("/:reviewId", requireAuth, deleteReview);

module.exports = router;
