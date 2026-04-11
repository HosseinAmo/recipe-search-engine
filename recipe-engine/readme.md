# Recipe Search Engine

**Web Technologies — Assignment 2 | Griffith College Cork**  
**Group:** GCC-26 | **Deadline:** 10/04/26

---

## Live URL

> **https://recipe-engine-gcc26.onrender.com**  
> *(Replace with your actual Render URL before submission)*

---

## Project Overview

A full-stack recipe search engine built on the MERN stack. Users enter ingredients they already have and the system returns ranked recipes based on ingredient overlap, cook time, and rating. All user data persists across sessions via MongoDB Atlas.

---

## How to Run Locally

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (free tier) or local MongoDB

### Server setup
```bash
cd server
cp .env.example .env        # Fill in your MongoDB URI and secrets
npm install
node ../data/seed.js        # Seed the database with 50 recipes (run once)
npm run dev                 # Starts on http://localhost:5001
```

### Frontend
Open `index.html` directly in your browser — no build step required.

---

## Implemented Features

### Assignment 2 Requirements

| Requirement | Implementation |
|---|---|
| Users Management | Register, login, logout with express-session + bcrypt password hashing |
| SESSION | `express-session` with MongoDB store via `connect-mongo`. Session stored in `sessions` collection. |
| COOKIE | httpOnly session cookie (`connect.sid`) set on login, used to authenticate all protected routes |
| CRUD | Full REST API: POST/GET/PUT/DELETE on `/api/recipes`, `/api/reviews`, `/api/users/saved` |
| Server-side Validation | `express-validator` on all POST/PUT routes with user-appropriate error messages |
| Database | MongoDB Atlas — User, Recipe, Review collections; saved recipes stored in User document |
| Coding Standards | JSDoc comments on every function, consistent indentation, meaningful identifiers |
| Deploy Online | Hosted on Render — see live URL above |

### Six Core Functionalities (from Assignment 1 plan)

1. **Ingredient-Based Search** — Users enter ingredients; server ranks recipes by match score (matched ingredients ÷ searched ingredients), then cook time, then average rating.
2. **Advanced Filtering** — Filter results by dietary tags (vegetarian, vegan, gluten-free, dairy-free, nut-free), max cook time, and max calories.
3. **User Accounts & Sessions** — Session-based authentication with bcrypt password hashing. Sessions persist via MongoDB store.
4. **Save & Favourite Recipes** — Logged-in users can bookmark recipes; saved recipes viewable in their profile.
5. **Ratings & Reviews** — Authenticated users can leave one star rating + comment per recipe. Average rating updates automatically.
6. **Ingredient Autocomplete & Spell Correction** *(Extra Credit)* — As users type, the `/api/autocomplete` endpoint returns suggestions using a custom Levenshtein edit-distance algorithm for typo tolerance (e.g. "chiken" → "chicken").

---

## API Routes

### Auth — `/api/auth`
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/register` | Create new account | Public |
| POST | `/login` | Login and set session cookie | Public |
| POST | `/logout` | Destroy session and clear cookie | Private |
| GET | `/profile` | Get current user | Private |

### Recipes — `/api/recipes`
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/search?ingredients=...` | Search and rank recipes | Public |
| GET | `/` | All recipes (paginated) | Public |
| GET | `/:id` | Single recipe | Public |
| POST | `/` | Create recipe | Private |
| PUT | `/:id` | Update recipe (creator only) | Private |
| DELETE | `/:id` | Delete recipe (creator only) | Private |

### Reviews — `/api/reviews`
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/:recipeId` | All reviews for a recipe | Public |
| POST | `/` | Submit a review | Private |

### Users — `/api/users`
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/saved` | Get saved recipes | Private |
| POST | `/saved` | Save a recipe | Private |
| DELETE | `/saved/:recipeId` | Remove saved recipe | Private |

### Autocomplete — `/api/autocomplete`
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/?q=...` | Fuzzy ingredient suggestions | Public |

---

## Team Contributions

| Task | Owner |
|---|---|
| Express app setup, session/cookie config | Hossein |
| JWT auth, login/register/logout, authMiddleware | Hossein |
| Server-side validation (express-validator) | Hossein |
| Ingredient autocomplete + Levenshtein algorithm | Hossein |
| User.js, Recipe.js Mongoose models | Hossein |
| Frontend (index.html) — all views, auth modal, search UI | Hossein |
| Recipe search ranking algorithm, recipeController | Dylan |
| Recipe CRUD routes and controller (POST/PUT/DELETE) | Dylan |
| Review.js model, reviewController, reviews routes | Anna |
| userController, saved recipes routes | Flora |
| Database seed data (50 recipes) | Flora, Anna |
| Deployment to Render | Dylan |
| readme.md | All |

---

## Folder Structure

```
/
├── index.html              # Self-contained frontend (open directly in browser)
├── styles.css              # Frontend styles
├── app.js                  # Frontend JavaScript
├── package.json            # Root package.json (convenience scripts)
├── readme.md
├── .gitignore
├── data/
│   └── seed.js             # Run once to seed 50 recipes into MongoDB
└── server/
    ├── index.js            # Entry point — connects MongoDB, starts Express
    ├── app.js              # Express app, middleware, routes
    ├── .env                # Environment variables (not committed to git)
    ├── .env.example        # Template for environment variables
    ├── package.json
    ├── seed.js             # Alternate seed script location
    ├── models/
    │   ├── User.js
    │   ├── Recipe.js
    │   └── Review.js
    ├── routes/
    │   ├── auth.js
    │   ├── recipes.js
    │   ├── reviews.js
    │   ├── users.js
    │   └── autocomplete.js
    ├── controllers/
    │   ├── authController.js
    │   ├── recipeController.js
    │   ├── reviewController.js
    │   ├── userController.js
    │   └── autocompleteController.js
    └── middleware/
        ├── auth.js
        └── validateMiddleware.js
```

---

## References & Third-Party Resources

- Express.js documentation: https://expressjs.com/
- Mongoose documentation: https://mongoosejs.com/docs/
- express-validator: https://express-validator.github.io/docs/
- express-session: https://github.com/expressjs/session
- connect-mongo: https://github.com/jdesboeufs/connect-mongo
- bcryptjs: https://github.com/dcodeIO/bcrypt.js
- Levenshtein distance algorithm: https://en.wikipedia.org/wiki/Levenshtein_distance
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Google Fonts (Playfair Display, DM Sans): https://fonts.google.com/

---

## Changes from Assignment 1 Plan

- Session management uses `express-session` with a MongoDB store (`connect-mongo`) rather than a PHP-style `$_SESSION`. This integrates cleanly with Node/Express and satisfies both the SESSION and COOKIE requirements: the session cookie (`connect.sid`) is httpOnly and stored on the client, while session data (userId, name, email) lives server-side in the MongoDB `sessions` collection.
- The autocomplete fuzzy matching uses a custom Levenshtein edit-distance implementation (in `autocompleteController.js`) rather than a third-party library. This goes beyond the brief requirements and is marked with EXTRA CREDIT comments in the source.
- Frontend delivered as a single `index.html` file (no React build step) to simplify local setup and submission. The React SPA described in Assignment 1 is planned for Assignment 3.
- The SavedRecipe model was not implemented as a separate collection; instead, saved recipe IDs are stored as an array in the User document (`savedRecipes: [ObjectId]`). This is simpler and equally functional for the current scope.
