const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { getReviews, createReview } = require('../controllers/reviewController');

router.get('/:recipeId', getReviews);
router.post('/', requireAuth, createReview);

module.exports = router;
