const router = require("express").Router();
const { searchRecipes, getRecipe } = require("../controllers/recipeController");

router.get("/search", searchRecipes);
router.get("/:id", getRecipe);

module.exports = router;
