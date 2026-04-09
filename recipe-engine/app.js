// ═══════════════════════════════════════════════════════
// CONFIG — change API_BASE if your server runs elsewhere
// ═══════════════════════════════════════════════════════
const API_BASE = "http://localhost:5001/api";

// ─── STATE ────────────────────────────────────────────
const state = {
  user: null,
  ingredients: [],
  homeFilters: [],
  currentSearch: {
    ingredients: "",
    dietary: "",
    cookTimeMax: "",
    caloriesMax: "",
  },
  currentRecipe: null,
  pickedRating: 0,
};

// ─── HELPERS ──────────────────────────────────────────
function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function starsHTML(rating) {
  return Array.from(
    { length: 5 },
    (_, i) =>
      `<span>${i < Math.floor(rating) ? "★" : i < rating ? "⯨" : "☆"}</span>`,
  ).join("");
}

const EMOJIS = [
  "🍜",
  "🥘",
  "🍲",
  "🥗",
  "🍛",
  "🍝",
  "🫕",
  "🥩",
  "🍱",
  "🧆",
  "🥞",
  "🍔",
];
function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

// ─── API ──────────────────────────────────────────────
async function api(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ─── TOAST ────────────────────────────────────────────
function toast(msg, type = "") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = "toast show " + type;
  setTimeout(() => {
    el.className = "toast";
  }, 2800);
}

// ─── VIEWS ────────────────────────────────────────────
function showView(name) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById("view-" + name).classList.add("active");
  window.scrollTo(0, 0);
}

// ─── NAVBAR ───────────────────────────────────────────
function renderNav() {
  const el = document.getElementById("navLinks");
  el.innerHTML = state.user
    ? `
    <button class="nav-btn" onclick="showView('home')">Home</button>
    <button class="nav-btn" onclick="loadSaved()">Saved</button>
    <span class="nav-greeting">Hi, ${esc(state.user.name)}</span>
    <button class="nav-btn" onclick="doLogout()">Logout</button>
  `
    : `
    <button class="nav-btn" onclick="showView('home')">Home</button>
    <button class="nav-btn" onclick="openModal('login')">Login</button>
    <button class="nav-btn primary" onclick="openModal('register')">Register</button>
  `;
}

// ─── SESSION RESTORE ──────────────────────────────────
async function restoreSession() {
  try {
    const { ok, data } = await api("/auth/profile");
    if (ok && data.success) {
      state.user = data.user;
      renderNav();
    }
  } catch {
    /* no session */
  }
}

// ─── INGREDIENT TAGS ──────────────────────────────────
function renderTags() {
  const wrap = document.getElementById("tagWrap");
  wrap.querySelectorAll(".ing-tag").forEach((t) => t.remove());
  const input = document.getElementById("tagInput");
  state.ingredients.forEach((ing) => {
    const tag = document.createElement("div");
    tag.className = "ing-tag";
    tag.innerHTML = `${esc(ing)} <button onclick="removeTag('${esc(ing)}')" aria-label="remove ${esc(ing)}">×</button>`;
    wrap.insertBefore(tag, input);
  });
  document.getElementById("searchGoBtn").disabled =
    state.ingredients.length === 0;
}

function addTag(val) {
  const v = val.trim().toLowerCase();
  if (v && !state.ingredients.includes(v)) {
    state.ingredients.push(v);
    renderTags();
  }
  document.getElementById("tagInput").value = "";
  closeAc();
}

function removeTag(ing) {
  state.ingredients = state.ingredients.filter((i) => i !== ing);
  renderTags();
}

function onTagKeyDown(e) {
  if (e.key === "Enter" && e.target.value.trim()) {
    e.preventDefault();
    addTag(e.target.value);
  }
}

// ─── AUTOCOMPLETE ─────────────────────────────────────
let acTimer;

function onTagInput(val) {
  clearTimeout(acTimer);
  if (val.length < 2) {
    closeAc();
    return;
  }
  acTimer = setTimeout(async () => {
    try {
      const { ok, data } = await api(
        "/autocomplete?q=" + encodeURIComponent(val),
      );
      if (ok && data.suggestions?.length) renderAc(data.suggestions);
      else closeAc();
    } catch {
      closeAc();
    }
  }, 280);
}

function renderAc(suggestions) {
  const dd = document.getElementById("acDropdown");
  dd.innerHTML = suggestions
    .map(
      (s) =>
        `<div class="ac-item" onmousedown="addTag('${esc(s)}')">${esc(s)}</div>`,
    )
    .join("");
  dd.classList.add("open");
}

function closeAc() {
  const dd = document.getElementById("acDropdown");
  dd.classList.remove("open");
  dd.innerHTML = "";
}

// ─── HOME FILTERS ─────────────────────────────────────
function toggleHomeFilter(btn) {
  btn.classList.toggle("active");
  const f = btn.dataset.filter;
  if (state.homeFilters.includes(f)) {
    state.homeFilters = state.homeFilters.filter((x) => x !== f);
  } else {
    state.homeFilters.push(f);
  }
}

// ─── SEARCH ───────────────────────────────────────────
function doSearch() {
  if (!state.ingredients.length) return;
  state.currentSearch = {
    ingredients: state.ingredients.join(","),
    dietary: state.homeFilters.join(","),
    cookTimeMax: document.getElementById("cookTimeMax").value,
    caloriesMax: document.getElementById("caloriesMax").value,
  };
  loadResults();
}

function applyFilters() {
  state.currentSearch.dietary = [
    ...document.querySelectorAll(".sidebar-chip.active"),
  ]
    .map((b) => b.dataset.filter)
    .join(",");
  state.currentSearch.cookTimeMax = document.getElementById("sbCookTime").value;
  state.currentSearch.caloriesMax = document.getElementById("sbCalories").value;
  loadResults();
}

async function loadResults() {
  showView("results");
  const grid = document.getElementById("recipeGrid");
  const { ingredients, dietary, cookTimeMax, caloriesMax } =
    state.currentSearch;

  document.getElementById("resultsHeading").innerHTML =
    `Recipes using <span>${esc(ingredients.replace(/,/g, ", "))}</span>`;
  document.getElementById("resultsMeta").textContent = "";
  renderSidebarFilters();

  grid.innerHTML = `<div class="state-msg"><div class="spinner"></div><p>Finding recipes…</p></div>`;

  try {
    const params = new URLSearchParams({ ingredients });
    if (dietary) params.set("dietary", dietary);
    if (cookTimeMax) params.set("cookTimeMax", cookTimeMax);
    if (caloriesMax) params.set("caloriesMax", caloriesMax);

    const { ok, data } = await api("/recipes/search?" + params);

    if (ok && data.success && data.recipes?.length) {
      document.getElementById("resultsMeta").textContent =
        `${data.recipes.length} recipe${data.recipes.length !== 1 ? "s" : ""} found`;
      grid.innerHTML = data.recipes.map(recipeCardHTML).join("");
    } else {
      grid.innerHTML = `<div class="state-msg">
        <span class="emoji">🥕</span>
        <h3>No recipes found</h3>
        <p>Try different ingredients or remove some filters.</p>
      </div>`;
    }
  } catch {
    grid.innerHTML = `<div class="state-msg">
      <span class="emoji">⚠️</span>
      <h3>Could not connect to the server</h3>
      <p>Make sure the Express server is running on <strong>localhost:5000</strong>.</p>
    </div>`;
  }
}

function renderSidebarFilters() {
  const OPTS = ["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"];
  const active = state.currentSearch.dietary?.split(",") || [];
  document.getElementById("sidebarDietary").innerHTML = OPTS.map(
    (o) =>
      `<button class="sidebar-chip ${active.includes(o) ? "active" : ""}" data-filter="${o}"
      onclick="this.classList.toggle('active')">${o}</button>`,
  ).join("");
  document.getElementById("sbCookTime").value =
    state.currentSearch.cookTimeMax || "";
  document.getElementById("sbCalories").value =
    state.currentSearch.caloriesMax || "";
}

function recipeCardHTML(r) {
  const img = r.image
    ? `<img class="card-img" src="${esc(r.image)}" alt="${esc(r.title)}" loading="lazy" />`
    : `<div class="card-img-placeholder">${randomEmoji()}</div>`;
  const tags = (r.dietaryTags || [])
    .map((t) => `<span class="card-tag">${esc(t)}</span>`)
    .join("");
  const match =
    r.matchScore !== undefined
      ? `<span class="card-match">✓ ${Math.round(r.matchScore * 100)}% match</span>`
      : "";
  return `
    <div class="recipe-card" onclick="loadDetail('${r._id}')">
      ${img}
      <div class="card-body">
        <div class="card-title">${esc(r.title)}</div>
        <div class="card-stats">
          <span>⏱ ${r.cookTime}min</span>
          <span>🍽 ${r.servings}</span>
          ${r.calories ? `<span>🔥 ${r.calories}kcal</span>` : ""}
        </div>
        <div class="stars">${starsHTML(r.averageRating || 0)}
          <small style="color:var(--ink3)">(${r.reviewCount || 0})</small>
        </div>
        ${tags ? `<div class="card-tags">${tags}</div>` : ""}
        ${match}
      </div>
    </div>`;
}

// ─── RECIPE DETAIL ────────────────────────────────────
async function loadDetail(id) {
  showView("detail");
  const wrap = document.getElementById("detailWrap");
  wrap.innerHTML = `<div style="padding:4rem;text-align:center"><div class="spinner"></div></div>`;
  try {
    const { ok, data } = await api("/recipes/" + id);
    if (!ok || !data.success) throw new Error("Not found");
    state.currentRecipe = data.recipe;
    renderDetail(data.recipe, data.isSaved || false);
  } catch {
    wrap.innerHTML = `<div class="state-msg"><span class="emoji">😕</span><h3>Recipe not found</h3></div>`;
  }
}

function renderDetail(r, isSaved) {
  const wrap = document.getElementById("detailWrap");
  const imgBlock = r.image
    ? `<div class="detail-hero"><img src="${esc(r.image)}" alt="${esc(r.title)}" /></div>`
    : `<div class="detail-hero">${randomEmoji()}</div>`;
  const tags = (r.dietaryTags || [])
    .map((t) => `<span class="detail-badge">${esc(t)}</span>`)
    .join("");
  const ings = (r.ingredients || [])
    .map((i) => `<li>${i.amount} ${esc(i.unit || "")} ${esc(i.name)}</li>`)
    .join("");
  const saveBtn = state.user
    ? `
    <button class="save-btn ${isSaved ? "saved" : ""}" id="saveBtn" onclick="toggleSave('${r._id}')">
      ${isSaved ? "♥ Saved" : "♡ Save Recipe"}
    </button>`
    : "";

  wrap.innerHTML = `
    <button class="detail-back" onclick="showView('results')">← Back to results</button>
    ${imgBlock}
    <h1 class="detail-title">${esc(r.title)}</h1>
    <div class="detail-meta-row">
      <span>⏱ ${r.cookTime} min</span>
      <span>🍽 ${r.servings} servings</span>
      ${r.calories ? `<span>🔥 ${r.calories} kcal</span>` : ""}
      <span class="stars">${starsHTML(r.averageRating || 0)} (${r.reviewCount || 0} reviews)</span>
    </div>
    ${tags ? `<div class="detail-tag-row">${tags}</div>` : ""}
    ${saveBtn}
    <div class="detail-section">
      <h2>Ingredients</h2>
      <ul class="ingredient-list">${ings}</ul>
    </div>
    <div class="detail-section">
      <h2>Instructions</h2>
      <p class="instructions-text">${esc(r.instructions)}</p>
    </div>
    <div class="detail-section" id="reviewsSection">
      <h2>Reviews</h2>
      <div id="reviewsContent"></div>
    </div>`;

  loadReviews(r._id);
}

async function toggleSave(id) {
  if (!state.user) {
    openModal("login");
    return;
  }
  const btn = document.getElementById("saveBtn");
  const isSaved = btn.classList.contains("saved");
  try {
    if (isSaved) {
      await api("/users/saved/" + id, { method: "DELETE" });
      btn.classList.remove("saved");
      btn.textContent = "♡ Save Recipe";
      toast("Removed from saved");
    } else {
      await api("/users/saved", {
        method: "POST",
        body: JSON.stringify({ recipeId: id }),
      });
      btn.classList.add("saved");
      btn.textContent = "♥ Saved";
      toast("Recipe saved!", "success");
    }
  } catch {
    toast("Something went wrong", "error");
  }
}

// ─── REVIEWS ──────────────────────────────────────────
async function loadReviews(recipeId) {
  const el = document.getElementById("reviewsContent");
  if (!el) return;
  try {
    const { ok, data } = await api("/reviews/" + recipeId);
    const reviews = ok && data.reviews ? data.reviews : [];

    const formHTML = state.user
      ? `
      <div class="review-form-card">
        <h3>Leave a Review</h3>
        <div class="star-picker" id="starPicker">
          ${[1, 2, 3, 4, 5]
            .map(
              (n) =>
                `<button class="star-pick-btn" data-n="${n}" onclick="pickStar(${n})">★</button>`,
            )
            .join("")}
        </div>
        <textarea class="review-textarea" id="reviewText" placeholder="Write your review…" maxlength="1000"></textarea>
        <p class="field-err" id="reviewErr"></p>
        <button class="review-submit" onclick="submitReview('${recipeId}')">Submit Review</button>
      </div>`
      : `
      <p style="font-size:.88rem;color:var(--ink3);margin-bottom:1rem">
        <button onclick="openModal('login')" style="background:none;border:none;color:var(--rust);font-weight:600;cursor:pointer">Log in</button>
        to leave a review.
      </p>`;

    const reviewsHTML = reviews.length
      ? reviews
          .map(
            (rv) => `
        <div class="review-item">
          <div class="review-header">
            <span class="review-author">${esc(rv.userId?.name || "Anonymous")}</span>
            <span class="review-date">${new Date(rv.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="stars">${starsHTML(rv.rating)}</div>
          <p class="review-comment">${esc(rv.comment)}</p>
        </div>`,
          )
          .join("")
      : `<p style="color:var(--ink3);font-size:.9rem">No reviews yet. Be the first!</p>`;

    el.innerHTML = formHTML + reviewsHTML;
    state.pickedRating = 0;
  } catch {
    el.innerHTML = '<p style="color:var(--ink3)">Could not load reviews.</p>';
  }
}

function pickStar(n) {
  state.pickedRating = n;
  document.querySelectorAll(".star-pick-btn").forEach((btn) => {
    btn.classList.toggle("lit", parseInt(btn.dataset.n) <= n);
  });
}

async function submitReview(recipeId) {
  const errEl = document.getElementById("reviewErr");
  const comment = document.getElementById("reviewText").value.trim();
  if (!state.pickedRating) {
    errEl.textContent = "Please select a star rating.";
    return;
  }
  if (comment.length < 10) {
    errEl.textContent = "Review must be at least 10 characters.";
    return;
  }
  errEl.textContent = "";
  try {
    const { ok, data } = await api("/reviews", {
      method: "POST",
      body: JSON.stringify({ recipeId, rating: state.pickedRating, comment }),
    });
    if (ok && data.success) {
      toast("Review submitted!", "success");
      loadReviews(recipeId);
    } else {
      errEl.textContent = data.message || "Failed to submit.";
    }
  } catch {
    errEl.textContent = "Server error. Try again.";
  }
}

// ─── SAVED RECIPES ────────────────────────────────────
async function loadSaved() {
  if (!state.user) {
    openModal("login");
    return;
  }
  showView("saved");
  const grid = document.getElementById("savedGrid");
  grid.innerHTML = `<div class="state-msg"><div class="spinner"></div></div>`;
  try {
    const { ok, data } = await api("/users/saved");
    if (ok && data.success && data.recipes?.length) {
      grid.innerHTML = data.recipes.map(recipeCardHTML).join("");
    } else {
      grid.innerHTML = `<div class="state-msg">
        <span class="emoji">🔖</span>
        <h3>No saved recipes yet</h3>
        <p>Search for recipes and save your favourites.</p>
      </div>`;
    }
  } catch {
    grid.innerHTML = `<div class="state-msg"><span class="emoji">⚠️</span><h3>Could not load saved recipes</h3></div>`;
  }
}

// ─── AUTH MODAL ───────────────────────────────────────
function openModal(mode) {
  document.getElementById("authModal").classList.add("open");
  renderModal(mode);
}

function closeModal() {
  document.getElementById("authModal").classList.remove("open");
}

document.getElementById("authModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

function renderModal(mode) {
  const el = document.getElementById("modalContent");
  if (mode === "login") {
    el.innerHTML = `
      <h2 class="modal-title">Welcome back</h2>
      <p class="modal-sub">Log in to save recipes and leave reviews.</p>
      <div id="modalErr"></div>
      <div class="form-field">
        <label>Email</label>
        <input type="email" id="loginEmail" placeholder="you@example.com" />
        <p class="field-err" id="emailErr"></p>
      </div>
      <div class="form-field">
        <label>Password</label>
        <input type="password" id="loginPass" placeholder="Your password" />
        <p class="field-err" id="passErr"></p>
      </div>
      <button class="form-submit" id="loginBtn" onclick="doLogin()">Log In</button>
      <p class="modal-switch">No account? <button onclick="renderModal('register')">Register</button></p>`;
    document.getElementById("loginEmail").addEventListener("keydown", (e) => {
      if (e.key === "Enter") doLogin();
    });
    document.getElementById("loginPass").addEventListener("keydown", (e) => {
      if (e.key === "Enter") doLogin();
    });
  } else {
    el.innerHTML = `
      <h2 class="modal-title">Create account</h2>
      <p class="modal-sub">Join to save recipes and post reviews.</p>
      <div id="modalErr"></div>
      <div class="form-field">
        <label>Name</label>
        <input type="text" id="regName" placeholder="Your name" />
        <p class="field-err" id="nameErr"></p>
      </div>
      <div class="form-field">
        <label>Email</label>
        <input type="email" id="regEmail" placeholder="you@example.com" />
        <p class="field-err" id="regEmailErr"></p>
      </div>
      <div class="form-field">
        <label>Password</label>
        <input type="password" id="regPass" placeholder="Min. 8 chars, 1 uppercase, 1 number" />
        <p class="field-err" id="regPassErr"></p>
      </div>
      <button class="form-submit" id="regBtn" onclick="doRegister()">Create Account</button>
      <p class="modal-switch">Already have an account? <button onclick="renderModal('login')">Log in</button></p>`;
  }
}

async function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;
  let valid = true;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    document.getElementById("emailErr").textContent = "Enter a valid email.";
    valid = false;
  } else {
    document.getElementById("emailErr").textContent = "";
  }
  if (!password) {
    document.getElementById("passErr").textContent = "Password is required.";
    valid = false;
  } else {
    document.getElementById("passErr").textContent = "";
  }
  if (!valid) return;

  const btn = document.getElementById("loginBtn");
  btn.disabled = true;
  btn.textContent = "Logging in…";
  try {
    const { ok, data } = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (ok && data.success) {
      state.user = data.user;
      renderNav();
      closeModal();
      toast(`Welcome back, ${data.user.name}!`, "success");
    } else {
      document.getElementById("modalErr").innerHTML =
        `<div class="server-err">${esc(data.message || "Login failed.")}</div>`;
    }
  } catch {
    document.getElementById("modalErr").innerHTML =
      `<div class="server-err">Could not reach the server. Is it running?</div>`;
  }
  btn.disabled = false;
  btn.textContent = "Log In";
}

async function doRegister() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPass").value;
  let valid = true;

  if (name.length < 2) {
    document.getElementById("nameErr").textContent =
      "Name must be at least 2 characters.";
    valid = false;
  } else {
    document.getElementById("nameErr").textContent = "";
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    document.getElementById("regEmailErr").textContent = "Enter a valid email.";
    valid = false;
  } else {
    document.getElementById("regEmailErr").textContent = "";
  }
  if (pass.length < 8 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) {
    document.getElementById("regPassErr").textContent =
      "Min 8 chars, 1 uppercase, 1 number.";
    valid = false;
  } else {
    document.getElementById("regPassErr").textContent = "";
  }
  if (!valid) return;

  const btn = document.getElementById("regBtn");
  btn.disabled = true;
  btn.textContent = "Creating account…";
  try {
    const { ok, data } = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password: pass }),
    });
    if (ok && data.success) {
      state.user = data.user;
      renderNav();
      closeModal();
      toast(`Welcome, ${data.user.name}! 🎉`, "success");
    } else {
      const msg = data.errors
        ? data.errors.map((e) => e.msg).join(" · ")
        : data.message || "Registration failed.";
      document.getElementById("modalErr").innerHTML =
        `<div class="server-err">${esc(msg)}</div>`;
    }
  } catch {
    document.getElementById("modalErr").innerHTML =
      `<div class="server-err">Could not reach the server. Is it running?</div>`;
  }
  btn.disabled = false;
  btn.textContent = "Create Account";
}

async function doLogout() {
  await api("/auth/logout", { method: "POST" });
  state.user = null;
  renderNav();
  showView("home");
  toast("Logged out");
}

// ─── INIT ─────────────────────────────────────────────
restoreSession();
