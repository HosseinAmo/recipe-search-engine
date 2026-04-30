const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getSaved, saveRecipe, unsaveRecipe, getMyReviews } = require('../controllers/userController');

router.use(requireAuth);               // All user routes require login

router.get('/saved',             getSaved);
router.get('/reviews',           getMyReviews);
router.post('/saved',            saveRecipe);
router.delete('/saved/:recipeId', unsaveRecipe);

module.exports = router;
