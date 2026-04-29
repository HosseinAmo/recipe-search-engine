# Recipe Search Engine

**Web Technologies | Griffith College Cork | Group GCC-26**

A full-stack recipe search engine built on the MERN stack. Users enter ingredients they have and the app returns ranked recipes based on ingredient match, cook time, and rating.

---

## Live URL

[https://recipe-search-engine-1.onrender.com](https://recipe-search-engine-1.onrender.com)

> Note: Render free tier spins down after inactivity — allow up to 30 seconds on first load.

> ## Video demo

(https://griffithcollege628-my.sharepoint.com/:v:/g/personal/florarachel_katzandrade_student_griffith_ie/IQATL8lulfkzSbdFAw7SrWYaAUj7c7tkyqf33OujCGUzMzQ?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D&e=j2jTXq)

> 

---

## Team

| Name | Student No. | Contribution |
|---|---|---|
| Mohammadhossein Amouei | 3145625 | Auth, sessions, validation, autocomplete (Levenshtein), js-cookie integration, full frontend |
| Dylan Donnell | 3145667 | Recipe search ranking algorithm, ingredient match scoring, full recipe CRUD, router fixes, deployment |
| Flora Katz-Andrade | 3138330 | Saved recipes, SavedRecipe model, userController, database seed, Admin Dashboard, profile reviews |
| Anna Shumilova | 3140507 | Reviews system, Review model, reviewController, average rating calculation, CookiesConsent component |

### Division of Labour

| Name | Share | Work |
|---|---|---|
| Mohammadhossein Amouei | 30% | React app scaffold, routing, HomePage, LoginPage, RegisterPage, SearchResultsPage, RecipeDetailPage, AuthContext, Navbar, RecipeCard, FilterPanel, StarRating, js-cookie auth token management |
| Dylan Donnell | 30% | Client-side validation, full API integration, recipe CRUD routes, router constant fix, removal of unneeded files, Render deployment |
| Flora Katz-Andrade | 20% | SavedRecipesPage, ProfilePage with reviews, Admin Dashboard (add recipe form), DB schema design, seed script (500+ recipes) |
| Anna Shumilova | 20% | ReviewsSection (submit, delete, hover stars, char counter, rating summary), CookiesConsent popup with js-cookie |

---

## API Routes

### Auth — `/api/auth`

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/register` | Create account | Public |
| POST | `/login` | Login — creates session + sets cookie | Public |
| POST | `/logout` | Destroy session and clear cookie | Private |
| GET | `/profile` | Get current user | Private |

### Recipes — `/api/recipes`

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/search?ingredients=...` | Search and rank recipes | Public |
| GET | `/` | All recipes (paginated) | Public |
| GET | `/:id` | Single recipe | Public |
| POST | `/` | Create recipe | Admin only |
| PUT | `/:id` | Update recipe | Admin only |
| DELETE | `/:id` | Delete recipe | Admin only |

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
| GET | `/?q=...` | Fuzzy ingredient suggestions (Levenshtein) | Public |

---

## Assignment Requirements

| Requirement | Implementation |
|---|---|
| Users Management | Register, login, logout with bcrypt password hashing |
| SESSION | express-session with MongoDB store via connect-mongo |
| COOKIE | httpOnly session cookie set on login, cleared on logout. js-cookie used client-side |
| CRUD | Full REST API across recipes, reviews and saved recipes |
| Server-side Validation | express-validator on all POST/PUT routes with descriptive error messages |
| RBAC | requireRole middleware — admin-only POST/PUT/DELETE on recipes |
| Database | MongoDB Atlas — User, Recipe, Review, SavedRecipe collections + sessions |
| Coding Standards | JSDoc on every function, ESLint enforced, consistent indentation |
| Deploy Online | Hosted on Render — https://recipe-search-engine-1.onrender.com |
| Extra Credit | Levenshtein fuzzy matching on autocomplete endpoint (autocompleteController.js) |
| Extra Credit | CookiesConsent GDPR popup (CookiesConsent.jsx) |
| Extra Credit | Admin Dashboard — RBAC-protected recipe management page (AdminPage.jsx) |

---

## Tech Stack

**Backend (Assignment 2)**
- Node.js / Express.js
- MongoDB Atlas / Mongoose
- bcryptjs — password hashing
- express-session + connect-mongo — server-side sessions
- express-validator — server-side validation
- cookie-parser — cookie middleware

**Frontend (Assignment 3)**
- React 18 — functional components and hooks
- React Router DOM v6 — client-side routing
- Axios — HTTP client
- js-cookie — client-side cookie management
- Vite — build tool
- Plain CSS — component-scoped styles

---

## Project Structure

```
recipe-engine/
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── recipeController.js
│   │   ├── reviewController.js
│   │   ├── userController.js
│   │   └── autocompleteController.js   ← Levenshtein (extra credit)
│   ├── middleware/
│   │   ├── authMiddleware.js            ← protect + requireRole (RBAC)
│   │   └── validateMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Recipe.js
│   │   ├── Review.js
│   │   └── SavedRecipe.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── recipes.js
│   │   ├── reviews.js
│   │   ├── users.js
│   │   └── autocomplete.js
│   ├── app.js
│   └── index.js
├── client/
│   └── src/
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── SearchResultsPage.jsx
│       │   ├── RecipeDetailPage.jsx
│       │   ├── SavedRecipesPage.jsx
│       │   ├── ProfilePage.jsx
│       │   └── AdminPage.jsx            ← Admin Dashboard (extra credit)
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── RecipeCard.jsx
│       │   ├── ReviewsSection.jsx
│       │   ├── FilterPanel.jsx
│       │   ├── StarRating.jsx
│       │   ├── PrivateRoute.jsx
│       │   └── CookiesConsent.jsx       ← Cookie consent (extra credit)
│       ├── context/
│       │   └── AuthContext.jsx
│       └── utils/
│           └── api.js
├── data/
│   └── seed.js
└── README.md
```

---

## Running Locally

### Backend
```bash
cd recipe-engine/server
npm install
# create .env with MONGO_URI and SESSION_SECRET
node index.js
# runs on http://localhost:5000
```

### Frontend
```bash
cd recipe-engine/client
npm install
npm run dev
# runs on http://localhost:3000
# Vite proxies /api to http://localhost:5000
```

---

## References

- Express.js — https://expressjs.com/
- Mongoose — https://mongoosejs.com/docs/
- express-validator — https://express-validator.github.io/docs/
- express-session — https://github.com/expressjs/session
- connect-mongo — https://github.com/jdesboeufs/connect-mongo
- React Documentation — https://react.dev/
- React Router DOM — https://reactrouter.com/
- Axios — https://axios-http.com/docs/intro
- js-cookie — https://github.com/js-cookie/js-cookie
- Vite — https://vitejs.dev/
- Levenshtein Distance — https://en.wikipedia.org/wiki/Levenshtein_distance
- MongoDB Atlas — https://www.mongodb.com/docs/atlas/
- Render Deployment — https://render.com/docs
- Google Fonts — https://fonts.google.com/
