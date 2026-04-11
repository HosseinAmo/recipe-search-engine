/**
 * @file recipeController.js
 * @description Controller for recipe search, retrieval, and CRUD operations.
 * @author Dylan
 */

const Recipe = require('../models/Recipe');
const User   = require('../models/User');

/**
 * GET /api/recipes/search?ingredients=...&dietary=...&cookTimeMax=...&caloriesMax=...
 *
 * Scores each recipe by: matchedIngredients / searchedIngredients.
 * Recipes with score > 0 are returned, sorted descending by score,
 * then by cookTime ascending, then by averageRating descending.
 */
async function searchRecipes(req, res) {
  try {
    const { ingredients, dietary, cookTimeMax, caloriesMax } = req.query;

    if (!ingredients) {
      return res.status(400).json({ success: false, message: 'ingredients query param required.' });
    }

    const terms = ingredients.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const filter = {};

    if (dietary) {
      const tags = dietary.split(',').map(s => s.trim()).filter(Boolean);
      if (tags.length) filter.dietaryTags = { $all: tags };
    }
    if (cookTimeMax) filter.cookTime = { $lte: Number(cookTimeMax) };
    if (caloriesMax) filter.calories = { $lte: Number(caloriesMax) };

    const recipes = await Recipe.find(filter).lean();

    const scored = recipes.map(r => {
      const recipeIngNames = (r.ingredients || []).map(i => i.name.toLowerCase());
      const matched = terms.filter(t => recipeIngNames.some(ri => ri.includes(t)));
      return { ...r, matchScore: matched.length / terms.length };
    });

    const results = scored
      .filter(r => r.matchScore > 0)
      .sort((a, b) =>
        b.matchScore - a.matchScore ||
        a.cookTime  - b.cookTime   ||
        b.averageRating - a.averageRating
      );

    return res.json({ success: true, recipes: results });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/recipes
 * Returns all recipes, paginated (default: page 1, limit 20).
 */
async function getAllRecipes(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      Recipe.find().skip(skip).limit(limit).lean(),
      Recipe.countDocuments(),
    ]);

    return res.json({ success: true, recipes, total, page, limit });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/recipes/:id
 * Returns a single recipe and whether the logged-in user has saved it.
 */
async function getRecipe(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    let isSaved = false;
    if (req.session?.userId) {
      const user = await User.findById(req.session.userId).select('savedRecipes');
      isSaved = user?.savedRecipes?.some(id => id.equals(recipe._id)) ?? false;
    }

    return res.json({ success: true, recipe, isSaved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/recipes
 * Creates a new recipe. Requires authentication.
 */
async function createRecipe(req, res) {
  try {
    const { title, description, ingredients, instructions, cookTime, servings, calories, dietaryTags, image } = req.body;

    const recipe = await Recipe.create({
      title,
      description:  description  || '',
      ingredients,
      instructions,
      cookTime:     Number(cookTime),
      servings:     Number(servings),
      calories:     calories    ? Number(calories)    : null,
      dietaryTags:  dietaryTags || [],
      image:        image       || null,
      createdBy:    req.user._id,
    });

    return res.status(201).json({ success: true, recipe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/recipes/:id
 * Updates an existing recipe. Only the creator may update it.
 */
async function updateRecipe(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    if (recipe.createdBy && recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to update this recipe.' });
    }

    const allowed = ['title', 'description', 'ingredients', 'instructions', 'cookTime', 'servings', 'calories', 'dietaryTags', 'image'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) recipe[field] = req.body[field];
    });

    await recipe.save();
    return res.json({ success: true, recipe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/recipes/:id
 * Deletes a recipe. Only the creator may delete it.
 */
async function deleteRecipe(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    if (recipe.createdBy && recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this recipe.' });
    }

    await recipe.deleteOne();
    return res.json({ success: true, message: 'Recipe deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { searchRecipes, getAllRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe };
