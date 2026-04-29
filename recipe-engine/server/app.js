/**
 * @file app.js
 * @description Express application setup: middleware, routes, error handling.
 * @author Hossein
 */

const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const autocompleteRoutes = require("./routes/autocomplete");
const recipeRoutes = require("./routes/recipes");
const userRoutes = require("./routes/users");
const reviewRoutes = require("./routes/reviews");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("CORS blocked: " + origin));
    },
    credentials: true,
  })
);

// Session Configuration
// rolling: true resets the session timer whenever the user makes a request.
// Session expires after 3 hours of inactivity.
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 3 * 60 * 60, // 3 hours in seconds
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
    },
  })
);

app.use(express.static(path.join(__dirname, "..")));

app.use("/api/auth", authRoutes);
app.use("/api/autocomplete", autocompleteRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running." });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected server error occurred.",
  });
});

module.exports = app;