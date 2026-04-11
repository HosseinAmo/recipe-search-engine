/**
 * @file app.js
 * @description Express application setup: middleware, routes, error handling.
 * @author Hossein
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const autocompleteRoutes = require('./routes/autocomplete');

// Import routes owned by other team members
const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');

const app = express();

// ─── Core Middleware ───────────────────────────────────────────────────────────

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Parse cookies (required for httpOnly JWT cookie access)
app.use(cookieParser());

// CORS - allow file://, Live Server, Vite, CRA etc.
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('CORS blocked: ' + origin));
    },
    credentials: true,
  })
);

// ─── Session Configuration ─────────────────────────────────────────────────────
// express-session with MongoDB store (connect-mongo) for server-side sessions.
// Sessions are stored in the MongoDB 'sessions' collection.
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 7 * 24 * 60 * 60, // Session TTL: 7 days (seconds)
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    },
  })
);
// Serve frontend static files

const path = require('path');
app.use(express.static(path.join(__dirname, '..')));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/autocomplete', autocompleteRoutes); // EXTRA CREDIT: fuzzy autocomplete
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running.' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches any unhandled errors thrown in route handlers.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
  });
});

module.exports = app;
