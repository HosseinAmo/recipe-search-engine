const router = require("express").Router();
const Recipe = require("../models/Recipe");

// GET /api/autocomplete?q=chick
router.get("/", async (req, res) => {
  try {
    const q = (req.query.q || "").trim().toLowerCase();
    if (q.length < 2) return res.json({ success: true, suggestions: [] });

    // Pull all ingredient names that contain the query string
    const recipes = await Recipe.find(
      { "ingredients.name": { $regex: q, $options: "i" } },
      { "ingredients.name": 1 },
    ).lean();

    const set = new Set();
    for (const r of recipes) {
      for (const ing of r.ingredients) {
        if (ing.name.toLowerCase().includes(q)) set.add(ing.name.toLowerCase());
      }
    }

    const suggestions = [...set].sort().slice(0, 8);
    return res.json({ success: true, suggestions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
