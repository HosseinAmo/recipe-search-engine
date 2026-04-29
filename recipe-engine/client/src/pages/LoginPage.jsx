/**
 * @file LoginPage.jsx
 * @description Login form. Validates client-side before submitting.
 *              On success sets user in AuthContext via cookie-backed JWT.
 * @author Hossein
 */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

/**
 * LoginPage component.
 * Basic client-side validation then calls AuthContext login().
 */
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sessionExpired = params.get("expired") === "true";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Updates form field state on change.
   * @param {React.ChangeEvent} e
   */
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  /**
   * Validates form fields client-side before submission.
   * @returns {boolean} True if valid
   */
  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Enter a valid email.";
    if (!formData.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Submits login credentials to the API.
   */
  const handleSubmit = async () => {
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate("/");
      } else {
        setServerError(result.message || "Login failed.");
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Log In</h1>
        {sessionExpired && (
          <p className="auth-warning">
            Your session expired due to inactivity. Please log in again.
          </p>  
        )}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        {serverError && <p className="auth-server-error">{serverError}</p>}

        <button
          className="auth-submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
