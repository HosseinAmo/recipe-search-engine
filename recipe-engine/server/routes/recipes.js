/**
 * @file recipes.js
 * @description Routes for recipe CRUD and search.
 * @author Dylan
 */

const router = require("express").Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validateMiddleware");
const {
  searchRecipes,
  getAllRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");

// ─── Validation rules reused for create and update ───────────────────────────
const recipeValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 120 })
    .withMessage("Title must be 120 characters or fewer."),
  body("instructions")
    .trim()
    .notEmpty()
    .withMessage("Instructions are required."),
  body("cookTime")
    .isInt({ min: 1 })
    .withMessage("Cook time must be a positive integer (minutes)."),
  body("servings")
    .isInt({ min: 1 })
    .withMessage("Servings must be a positive integer."),
  body("ingredients")
    .isArray({ min: 1 })
    .withMessage("At least one ingredient is required."),
  body("ingredients.*.name")
    .trim()
    .notEmpty()
    .withMessage("Each ingredient must have a name."),
  body("ingredients.*.amount")
    .isNumeric()
    .withMessage("Each ingredient must have a numeric amount."),
];

// ─── Public routes ────────────────────────────────────────────────────────────

// GET /api/recipes/search?ingredients=chicken,garlic&dietary=vegetarian&cookTimeMax=30
router.get("/search", searchRecipes);

// GET /api/recipes  (paginated list)
router.get("/", getAllRecipes);

// GET /api/recipes/:id
router.get("/:id", getRecipe);

// ─── Protected routes (login required) ───────────────────────────────────────

// POST /api/recipes  — create a new recipe
router.post(
  "/",
  protect,
  requireRole("admin"),
  recipeValidation,
  validate,
  createRecipe,
);

// PUT /api/recipes/:id  — update a recipe (creator only)
router.put(
  "/:id",
  protect,
  requireRole("admin"),
  recipeValidation,
  validate,
  updateRecipe,
);

// DELETE /api/recipes/:id  — delete a recipe (creator only)
router.delete("/:id", protect, requireRole("admin"), deleteRecipe);

module.exports = router;
