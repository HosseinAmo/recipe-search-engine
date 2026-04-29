require("dotenv").config();
const mongoose = require("mongoose");
const Recipe = require("./models/Recipe");

const imageUpdates = {
  "Vegan Lentil Curry": "https://source.unsplash.com/600x400/?lentil,curry",
  "Garlic Butter Shrimp Pasta": "https://source.unsplash.com/600x400/?shrimp,pasta",
  "Avocado Toast": "https://source.unsplash.com/600x400/?avocado,toast",
  "Honey Garlic Chicken Wings": "https://source.unsplash.com/600x400/?chicken,wings",
  "Pea and Mint Soup": "https://source.unsplash.com/600x400/?pea,soup",
  "Caprese Salad": "https://source.unsplash.com/600x400/?caprese,salad",
  "Margherita Pizza": "https://source.unsplash.com/600x400/?margherita,pizza",
  "Mango Smoothie Bowl": "https://source.unsplash.com/600x400/?smoothie,bowl",
  "Lamb Kebabs": "https://source.unsplash.com/600x400/?lamb,kebab",
  "Butternut Squash Soup": "https://source.unsplash.com/600x400/?butternut,soup",
  "Fish and Chips": "https://source.unsplash.com/600x400/?fish,and,chips",
  "Oatmeal with Berries": "https://source.unsplash.com/600x400/?oatmeal,berries",
  "Black Bean Quesadillas": "https://source.unsplash.com/600x400/?quesadilla",
  "Homemade Hummus": "https://source.unsplash.com/600x400/?hummus",
  "Blueberry Muffins": "https://source.unsplash.com/600x400/?blueberry,muffins",
  "Vegetable Frittata": "https://source.unsplash.com/600x400/?frittata",
  "Pesto Pasta": "https://source.unsplash.com/600x400/?pesto,pasta",
  "Chicken Noodle Soup": "https://source.unsplash.com/600x400/?chicken,noodle,soup",
  "Falafel Wrap": "https://source.unsplash.com/600x400/?falafel,wrap",
  "Garlic Bread": "https://source.unsplash.com/600x400/?garlic,bread",
  "Baked Mac and Cheese": "https://source.unsplash.com/600x400/?mac,and,cheese",
  "Tuna Niçoise Salad": "https://source.unsplash.com/600x400/?nicoise,salad",
  "Leek and Potato Soup": "https://source.unsplash.com/600x400/?leek,potato,soup",
  "Smoked Salmon Bagels": "https://source.unsplash.com/600x400/?salmon,bagel",
  "Chilli Con Carne": "https://source.unsplash.com/600x400/?chili,con,carne",
};

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    for (const [title, image] of Object.entries(imageUpdates)) {
      const result = await Recipe.updateOne(
        { title },
        { $set: { image } }
      );

      console.log(`Updated ${title}: ${result.modifiedCount}`);
    }

    await mongoose.disconnect();
    console.log("Done.");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

updateImages();