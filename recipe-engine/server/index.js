/**
 * @file index.js
 * @description Server entry point. Connects to MongoDB Atlas and starts Express.
 * @author Hossein
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

/**
 * Connects to MongoDB Atlas and starts the Express server.
 * Exits the process on fatal connection errors.
 */
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
