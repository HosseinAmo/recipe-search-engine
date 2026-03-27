# Recipe Search Engine

**Web Technologies — Assignment 2 | Griffith College Cork**
**Group:** GCC-26 | **Deadline:** 05/04/26

---

## Live URL

> Deploy to Render/Railway and paste the URL here before submission.

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
npm run dev                 # Starts on http://localhost:5000
```

### Frontend
Open `index.html` directly in your browser — no build step required.

---

## Implemented Features

### Assignment 2 Requirements

| Requirement | Implementation |
|---|---|
| Users Management | Register, login, logout with JWT httpOnly cookie + express-session |
| SESSION | `express-session` with MongoDB store via `connect-mongo` |
| COOKIE | httpOnly JWT cookie set on login, refreshed on every authenticated request |
| CRUD | Full REST API: POST/GET/PUT/DELETE on `/api/recipes`, `/api/reviews`, `/api/users/saved` |
| Server-side Validation | `express-validator` on all POST/PUT routes with user-appropriate error messages |
| Database | MongoDB Atlas — User, Recipe, Review, SavedRecipe collections |
| Coding Standards | JSDoc comments on every function, ESLint enforced, consistent indentation |
| Deploy Online | Hosted on Render — see live URL above |

### Six Core Functionalities (from Assignment 1 plan)

1. **Ingredient-Based Search** — Users enter ingredients; server ranks recipes by match score (matched ingredients ÷ total recipe ingredients), then cook time, then average rating.
2. **Advanced Filtering** — Filter results by dietary tags (vegetarian, vegan, gluten-free, dairy-free, nut-free), max cook time, and max calories.
3. **User Accounts & Sessions** — JWT authentication with bcrypt password hashing. Sessions persist across devices via MongoDB.
4. **Save & Favourite Recipes** — Logged-in users can bookmark recipes; saved recipes viewable in their profile.
5. **Ratings & Reviews** — Authenticated users can leave one star rating + comment per recipe. Average rating updates automatically.
6. **Ingredient Autocomplete & Spell Correction** *(Extra Credit)* — As users type, the `/api/autocomplete` endpoint returns suggestions using a custom Levenshtein edit-distance algorithm for typo tolerance (e.g. "chiken" → "chicken").

---

## API Routes

### Auth — `/api/auth`
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/register` | Create new account | Public |
| POST | `/login` | Login and set JWT cookie | Public |
| POST | `/logout` | Clear cookie and session | Private |
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
| DELETE | `/:id` | Delete own review | Private |

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
| Recipe CRUD routes and controller | Dylan |
| Review.js model, reviewController, reviews routes | Anna |
| SavedRecipe.js model, userController, saved routes | Flora |
| Database seed data (50 recipes) | Flora, Anna |
| Deployment to Render | Dylan |
| readme.md | All |

---

## Folder Structure

```
/
├── index.html              # Self-contained frontend (open directly in browser)
├── readme.md
├── coversheet.pdf
├── data/
│   └── seed.js             # Run once to seed 50 recipes into MongoDB
└── server/
    ├── index.js            # Entry point — connects MongoDB, starts Express
    ├── app.js              # Express app, middleware, routes
    ├── .env.example        # Copy to .env and fill in values
    ├── package.json
    ├── models/
    │   ├── User.js
    │   ├── Recipe.js
    │   ├── Review.js
    │   └── SavedRecipe.js
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
        ├── authMiddleware.js
        └── validateMiddleware.js
```

---

## References & Third-Party Resources

- Express.js documentation: https://expressjs.com/
- Mongoose documentation: https://mongoosejs.com/docs/
- express-validator: https://express-validator.github.io/docs/
- JSON Web Tokens: https://jwt.io/introduction
- bcryptjs: https://github.com/dcodeIO/bcrypt.js
- connect-mongo: https://github.com/jdesboeufs/connect-mongo
- Levenshtein distance algorithm: https://en.wikipedia.org/wiki/Levenshtein_distance
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Google Fonts (Playfair Display, DM Sans): https://fonts.google.com/

---

## Changes from Assignment 1 Plan

- Session management changed from PHP-style `$_SESSION` to `express-session` with MongoDB store, as this integrates cleanly with our Node/Express stack.
- The autocomplete fuzzy matching uses a custom Levenshtein implementation rather than a third-party library, per the extra credit requirement to implement beyond-the-brief functionality.
- Frontend delivered as a single `index.html` file (no React build step required) to simplify local setup and submission.
