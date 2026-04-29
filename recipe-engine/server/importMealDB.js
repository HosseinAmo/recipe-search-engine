const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Recipe = require('./models/Recipe');

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

function getIngredients(meal) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const name = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (name && name.trim()) {
            ingredients.push({
                name: name.trim().toLowerCase(),
                amount: 1,
                unit: measure ? measure.trim() : '',
            });
        }
    }

    return ingredients;    
}

function getDietaryTags(meal) {
    const tags = [];

    const category = (meal.strCategory || '').toLowerCase();
    const mealName = (meal.strMeal || '').toLowerCase();

    if (category.includes('vegetaria')) tags.push('vegetarian');
    if (category.includes('vegan') || mealName.includes('vegan')) tags.push('vegan');
    if (category.includes('seafood')) tags.push('dairy-free');

    return tags;
}

async function fetchMealsByLetter(letter) {
    const response = await fetch(`${API_BASE}/search.php?f=${letter}`);
    const data = await response.json();
    return data.meals || [];
}

async function importMealDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const letters = 'abcdefghijklnmopqrstuvwxyz'.split('');
        const importedMeals = [];

        for (const letter of letters) {
            const meals = await fetchMealsByLetter(letter);

            for (const meal of meals) {
                //if (importedMeals.length >= 100) break;

                const exists = await Recipe.findOne({ title: meal.strMeal });

                if (exists) {
                    console.log(`Skipped duplicate: ${meal.strMeal}`);
                    continue;
                }

                const recipe = {
                    title: meal.strMeal,
                    description: meal.strArea
                        ? `${meal.strArea} recipe imported from TheMealDB.`
                        : 'Recipe imported from TheMealDB.',
                    ingredients: getIngredients(meal),
                    instructions: meal.strInstructions || 'No instrucstions provided.',
                    cookTime: 30,
                    servings: 4,
                    calories: null,
                    dietaryTags: getDietaryTags(meal),
                    image: meal.strMealThumb || 'https://placehold.co/600x400?text=Recipe',
                    averageRating: 0,
                    reviewCount: 0,
                };

                await Recipe.create(recipe);
                importedMeals.push(recipe.title);
                console.log(`Imported: ${recipe.title}`);
            }

            //if (importedMeals.length >= 100) break;
        }

        console.log(`Done. Imported ${importedMeals.length} MealDB recipes.`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('MealDB import error:', error.message);
        process.exit(1);
    }
}

importMealDB();