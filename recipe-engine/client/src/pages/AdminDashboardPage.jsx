import { useState, useEffect } from "react";
import api from "../utils/api";
import "./AdminDashboardPage.css";

const AdminDashboardPage = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    cookTime: "",
    servings: "",
    instructions: "",
    image: "",
  });

  const [ingredients, setIngredients] = useState([
    { name: "", amount: "", unit: "" },
  ]);

  const [message, setMessage] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const recipesPerPage = 50;

  const totalPages = Math.ceil(totalRecipes / recipesPerPage);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const fetchRecipes = async (pageNumber = page) => {
    setRecipesLoading(true);

    try {
      const res = await api.get(
        `/recipes?page=${pageNumber}&limit=${recipesPerPage}`
      );

      if (res.data.success) {
        setRecipes(res.data.recipes || []);
        setTotalRecipes(res.data.total || 0);
        setPage(res.data.page || pageNumber);
      }
    } catch (err) {
      console.error("Fetch recipes error:", err);
    } finally {
      setRecipesLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(1);
  }, []);

  const handleSubmit = async () => {
    setMessage("");

    try {
      const res = await api.post("/recipes", {
        ...form,
        cookTime: Number(form.cookTime),
        servings: Number(form.servings),
        ingredients: ingredients
          .filter((ing) => ing.name.trim() && ing.amount)
          .map((ing) => ({
            name: ing.name.trim(),
            amount: Number(ing.amount),
            unit: ing.unit.trim(),
          })),
      });

      if (res.data.success) {
        setMessage("✅ Recipe added successfully!");
        fetchRecipes(page);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error adding recipe");
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this recipe?"
    );

    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/recipes/${recipeId}`);

      if (res.data.success) {
        setRecipes((prev) => prev.filter((recipe) => recipe._id !== recipeId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete recipe.");
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="admin-card">
        <h2>Add Recipe</h2>

        <input name="title" placeholder="Title" onChange={handleChange} />
        <input
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />
        <input
          name="cookTime"
          placeholder="Cook Time (minutes)"
          onChange={handleChange}
        />
        <input name="servings" placeholder="Servings" onChange={handleChange} />
        <input name="image" placeholder="Image URL" onChange={handleChange} />

        <textarea
          name="instructions"
          placeholder="Instructions"
          onChange={handleChange}
        />

        <h3>Ingredients</h3>

        {ingredients.map((ing, i) => (
          <div key={i} className="ingredient-row">
            <input
              placeholder="Name"
              onChange={(e) =>
                handleIngredientChange(i, "name", e.target.value)
              }
            />
            <input
              placeholder="Amount"
              onChange={(e) =>
                handleIngredientChange(i, "amount", e.target.value)
              }
            />
            <input
              placeholder="Unit"
              onChange={(e) =>
                handleIngredientChange(i, "unit", e.target.value)
              }
            />
          </div>
        ))}

        <button onClick={addIngredient}>+ Add Ingredient</button>

        <button onClick={handleSubmit} className="admin-submit">
          Create Recipe
        </button>

        {message && <p>{message}</p>}
      </div>

      <div className="admin-card">
        <h2>Manage Recipes</h2>

        {recipesLoading ? (
          <p>Loading recipes...</p>
        ) : (
          <>
            <div className="admin-recipe-list">
              {recipes.map((recipe) => (
                <div key={recipe._id} className="admin-recipe-item">
                  <div>
                    <strong>{recipe.title}</strong>
                    <p>
                      {recipe.cookTime} min • {recipe.servings} servings
                    </p>
                  </div>

                  <button
                    className="admin-delete-btn"
                    onClick={() => handleDeleteRecipe(recipe._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="admin-pagination">
              <button onClick={() => fetchRecipes(page - 1)} disabled={page <= 1}>
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => fetchRecipes(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;