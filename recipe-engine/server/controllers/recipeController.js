const Recipe = require("../models/Recipe");
const User = require("../models/User");

// GET /api/recipes/search?ingredients=chicken,garlic&dietary=vegetarian&cookTimeMax=30&caloriesMax=600
async function searchRecipes(req, res) {
  try {
    const { ingredients, dietary, cookTimeMax, caloriesMax } = req.query;

    if (!ingredients) {
      return res
        .status(400)
        .json({ success: false, message: "ingredients query param required." });
    }

    const terms = ingredients
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const filter = {};

    // Dietary tag filter
    if (dietary) {
      const tags = dietary
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (tags.length) filter.dietaryTags = { $all: tags };
    }

    // Cook time filter
    if (cookTimeMax) filter.cookTime = { $lte: Number(cookTimeMax) };

    // Calories filter
    if (caloriesMax) filter.calories = { $lte: Number(caloriesMax) };

    const recipes = await Recipe.find(filter).lean();

    // Score each recipe by how many searched ingredients it contains
    const scored = recipes.map((r) => {
      const recipeIngs = (r.ingredients || []).map((i) => i.name.toLowerCase());
      const matched = terms.filter((t) =>
        recipeIngs.some((ri) => ri.includes(t)),
      );
      return { ...r, matchScore: matched.length / terms.length };
    });

    // Only return recipes with at least one matching ingredient, sorted by score
    const results = scored
      .filter((r) => r.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    return res.json({ success: true, recipes: results });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/recipes/:id
async function getRecipe(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe)
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found." });

    // Check if logged-in user has this saved
    let isSaved = false;
    if (req.session?.userId) {
      const user = await User.findById(req.session.userId).select(
        "savedRecipes",
      );
      isSaved =
        user?.savedRecipes?.some((id) => id.equals(recipe._id)) ?? false;
    }

    return res.json({ success: true, recipe, isSaved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { searchRecipes, getRecipe };
