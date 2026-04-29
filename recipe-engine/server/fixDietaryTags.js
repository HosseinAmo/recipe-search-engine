require("dotenv").config();
const mongoose = require("mongoose");
const Recipe = require("./models/Recipe");

const dairyWords = [
  "milk", "cheese", "butter", "cream", "yogurt", "parmesan",
  "mozzarella", "cheddar", "feta", "gruyère", "cream cheese",
  "double cream", "sour cream"
];

const meatFishWords = [
  "chicken", "beef", "pork", "lamb", "salmon", "tuna", "cod",
  "prawn", "prawns", "shrimp", "fish", "bacon", "pancetta",
  "anchovies", "sausage", "ham", "turkey", "meat"
];

const eggWords = ["egg", "eggs"];

const glutenWords = [
  "flour", "bread", "baguette", "pasta", "spaghetti", "linguine",
  "macaroni", "noodles", "tortillas", "flatbreads", "bagels",
  "breadcrumbs", "pizza dough", "buns", "pitta"
];

function hasAnyIngredient(recipe, words) {
  const ingredientText = recipe.ingredients
    .map((ing) => ing.name.toLowerCase())
    .join(" ");

  return words.some((word) => ingredientText.includes(word));
}

async function fixDietaryTags() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const recipes = await Recipe.find();
    let updatedCount = 0;

    for (const recipe of recipes) {
      let tags = [...(recipe.dietaryTags || [])];

      const hasDairy = hasAnyIngredient(recipe, dairyWords);
      const hasMeatFish = hasAnyIngredient(recipe, meatFishWords);
      const hasEgg = hasAnyIngredient(recipe, eggWords);
      const hasGluten = hasAnyIngredient(recipe, glutenWords);

      tags = tags.filter((tag) => {
        if (tag === "dairy-free" && hasDairy) return false;
        if (tag === "vegan" && (hasDairy || hasMeatFish || hasEgg)) return false;
        if (tag === "vegetarian" && hasMeatFish) return false;
        if (tag === "gluten-free" && hasGluten) return false;
        return true;
      });

      recipe.dietaryTags = tags;

      if (recipe.isModified("dietaryTags")) {
        await recipe.save();
        updatedCount++;
        console.log(`Fixed tags for: ${recipe.title}`);
      }
    }

    console.log(`Done. Updated ${updatedCount} recipes.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

fixDietaryTags();