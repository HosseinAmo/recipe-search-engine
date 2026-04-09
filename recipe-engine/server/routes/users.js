const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const {
  getSaved,
  saveRecipe,
  unsaveRecipe,
} = require("../controllers/userController");

router.use(requireAuth); // All user routes require login

router.get("/saved", getSaved);
router.post("/saved", saveRecipe);
router.delete("/saved/:recipeId", unsaveRecipe);

module.exports = router;
