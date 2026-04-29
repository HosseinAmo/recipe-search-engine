require("dotenv").config();
const mongoose = require("mongoose");
const Recipe = require("./models/Recipe");

const stillBad = [
  "Vegan Lentil Curry",
  "Garlic Butter Shrimp Pasta",
  "Avocado Toast",
  "Honey Garlic Chicken Wings",
  "Pea and Mint Soup",
  "Caprese Salad",
  "Margherita Pizza",
  "Mango Smoothie Bowl",
  "Lamb Kebabs",
  "Butternut Squash Soup",
  "Fish and Chips",
  "Oatmeal with Berries",
  "Black Bean Quesadillas",
  "Homemade Hummus",
  "Blueberry Muffins",
  "Vegetable Frittata",
  "Pesto Pasta",
  "Chicken Noodle Soup",
  "Falafel Wrap",
  "Garlic Bread",
  "Baked Mac and Cheese",
  "Tuna Niçoise Salad",
  "Leek and Potato Soup",
  "Smoked Salmon Bagels",
  "Chilli Con Carne",
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  for (const title of stillBad) {
    const placeholder = `https://placehold.co/600x400?text=${encodeURIComponent(title)}`;

    const result = await Recipe.updateOne(
      { title },
      { $set: { image: placeholder } }
    );

    console.log(`Reset ${title}: ${result.modifiedCount}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run();
