require("dotenv").config();
const mongoose = require("mongoose");
const Recipe = require("./models/Recipe");

const imageUpdates = {
  "Chicken Caesar Salad": "https://images.unsplash.com/photo-1551248429-40975aa4de74",
  "Vegan Lentil Curry": "https://images.unsplash.com/photo-1604908812140-3d9a7c4b47c2",
  "Garlic Butter Shrimp Pasta": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5",
  "Avocado Toast": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
  "Beef Tacos": "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
  "Shakshuka": "https://images.unsplash.com/photo-1604908176997-431c8d72c2b0",
  "Honey Garlic Chicken Wings": "https://images.unsplash.com/photo-1604908177522-402c0f4e9f50",
  "Pea and Mint Soup": "https://images.unsplash.com/photo-1604908554027-7d3d4e516be7",
  "Prawn Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
  "Caprese Salad": "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  "French Onion Soup": "https://images.unsplash.com/photo-1605478371310-a9f1e96b3e2d",
  "Pad Thai": "https://images.unsplash.com/photo-1553621042-f6e147245754",
  "Margherita Pizza": "https://images.unsplash.com/photo-1601924638867-3ec3b9bfb8f6",
  "Roast Chicken": "https://images.unsplash.com/photo-1600891963935-cf0f6c3c1e77",
  "Mango Smoothie Bowl": "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
  "Lamb Kebabs": "https://images.unsplash.com/photo-1601050690597-df0568f70950",
  "Butternut Squash Soup": "https://images.unsplash.com/photo-1547592180-85f173990554",
  "Fish and Chips": "https://images.unsplash.com/photo-1559847844-5315695dadae",
  "Oatmeal with Berries": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf",
  "Black Bean Quesadillas": "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f",
  "Teriyaki Salmon": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2",
  "Stuffed Bell Peppers": "https://images.unsplash.com/photo-1605478371310-9bfc3d4e516b",
  "Thai Green Curry": "https://images.unsplash.com/photo-1605478371310-7e4f208fb84b",
  "Homemade Hummus": "https://images.unsplash.com/photo-1604908177019-5e6c0d1e3c3c",
  "Beef Stew": "https://images.unsplash.com/photo-1604908554164-0d6c3c1e77f",
  "Blueberry Muffins": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af",
  "Prawn Tacos with Mango Salsa": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b",
  "Vegetable Frittata": "https://images.unsplash.com/photo-1604908177522-402c0f4e9f50",
  "Pesto Pasta": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5",
  "Chicken Noodle Soup": "https://images.unsplash.com/photo-1604908554027-7d3d4e516be7",
  "Falafel Wrap": "https://images.unsplash.com/photo-1604908176997-431c8d72c2b0",
  "Garlic Bread": "https://images.unsplash.com/photo-1604908177019-5e6c0d1e3c3c",
  "Baked Mac and Cheese": "https://images.unsplash.com/photo-1543332164-6e82f355badb",
  "Tuna Niçoise Salad": "https://images.unsplash.com/photo-1604908176997-431c8d72c2b0",
  "Carrot Cake": "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
  "Spicy Tofu Bowl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
  "Lamb Chops with Mint Sauce": "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
  "Leek and Potato Soup": "https://images.unsplash.com/photo-1604908554027-7d3d4e516be7",
  "Smoked Salmon Bagels": "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
  "Chilli Con Carne": "https://images.unsplash.com/photo-1600891963935-cf0f6c3c1e77",
};

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    for (const [title, image] of Object.entries(imageUpdates)) {
      if (!image) {
        console.log(`Skipped ${title} - no image URL yet`);
        continue;
      }

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