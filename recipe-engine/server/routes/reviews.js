/**
 * @file reviews.js
 * @description Review routes.
 * @author Anna
 */

const express = require('express');
const router = express.Router();
const { getReviewsByRecipe, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validateReview } = require('../middleware/validateMiddleware');

router.get('/:recipeId', getReviewsByRecipe);
router.post('/', protect, validateReview, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
