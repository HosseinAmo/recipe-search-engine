# Recipe Search Engine

**Web Technologies — Assignment 2 | Griffith College Cork | Group GCC-26**

A full-stack recipe search engine built on the MERN stack. Users enter ingredients they have and the app returns ranked recipes based on ingredient match, cook time, and rating.

---

## Live URL

(https://recipe-search-engine.onrender.com)

---

## Team

| Name | Student No. | Contribution |
|---|---|---|
| mohammadHossein Amouei | 3145625 | JWT auth, session/cookie config, server-side validation, autocomplete with Levenshtein algorithm, full frontend |
| Dylan Donnell | 3138330 | Recipe search ranking algorithm, ingredient match scoring, full recipe CRUD |
| Flora Katz-Andrade | 3145667 | Saved recipes, SavedRecipe model, userController, database seed |
| Anna Shumilova | 3145667 | Reviews system, Review model, reviewController, average rating calculation |

---

## Running Locally

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/recipe-search-engine.git
cd recipe-search-engine
```

### 2. Configure environment
```bash
cd server
cp .env.example .env
```
Fill in your MongoDB URI and secrets in `.env`.

### 3. Install and seed
```bash
npm install
node ../data/seed.js
```

### 4. Start the server
```bash
npm run dev
```

### 5. Open the frontend
Double-click `index.html` — no build step needed.

---

## Project Structure

```
/
├── index.html
├── README.md
├── data/
│   └── seed.js
└── server/
    ├── index.js
    ├── app.js
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

## API Routes

### Auth — `/api/auth`
| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/register` | Create account | Public |
| POST | `/login` | Login and set cookie | Public |
| POST | `/logout` | Clear session | Private |
| GET | `/profile` | Get current user | Private |

### Recipes — `/api/recipes`
| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/search?ingredients=...` | Search and rank recipes | Public |
| GET | `/` | All recipes | Public |
| GET | `/:id` | Single recipe | Public |
| POST | `/` | Create recipe | Private |
| PUT | `/:id` | Update recipe | Private |
| DELETE | `/:id` | Delete recipe | Private |

### Reviews — `/api/reviews`
| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/:recipeId` | Get reviews for a recipe | Public |
| POST | `/` | Submit a review | Private |
| DELETE | `/:id` | Delete own review | Private |

### Saved Recipes — `/api/users`
| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/saved` | Get saved recipes | Private |
| POST | `/saved` | Save a recipe | Private |
| DELETE | `/saved/:recipeId` | Remove saved recipe | Private |

### Autocomplete — `/api/autocomplete`
| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/?q=...` | Fuzzy ingredient suggestions | Public |

---

## Assignment Requirements

| Requirement | Implementation |
|---|---|
| Users Management | Register, login, logout with JWT and bcrypt |
| SESSION | express-session with MongoDB store via connect-mongo |
| COOKIE | httpOnly JWT cookie set on login, refreshed on activity |
| CRUD | Full REST API across recipes, reviews and saved recipes |
| Server-side Validation | express-validator on all POST/PUT routes |
| Database | MongoDB Atlas — User, Recipe, Review, SavedRecipe collections |
| Coding Standards | JSDoc comments on every function, ESLint enforced |
| Deploy Online | Hosted on Render — see live URL above |
| Extra Credit | Levenshtein fuzzy matching on autocomplete endpoint |

---

## Tech Stack

- Node.js / Express.js
- MongoDB Atlas / Mongoose
- JWT / bcryptjs / express-session
- express-validator
- Vanilla JS frontend (no build step)

---

## References

- Express.js — https://expressjs.com/
- Mongoose — https://mongoosejs.com/docs/
- express-validator — https://express-validator.github.io/docs/
- JSON Web Tokens — https://jwt.io/introduction
- Levenshtein Distance — https://en.wikipedia.org/wiki/Levenshtein_distance
- MongoDB Atlas — https://www.mongodb.com/docs/atlas/
- connect-mongo — https://github.com/jdesboeufs/connect-mongo
- Google Fonts — https://fonts.google.com/
