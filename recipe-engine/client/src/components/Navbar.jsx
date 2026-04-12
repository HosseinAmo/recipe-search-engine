/**
 * @file Navbar.jsx
 * @description Top navigation bar. Shows login/register links when logged out,
 *              and profile/saved/logout links when logged in.
 * @author Hossein
 */

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

/**
 * Navbar component.
 * Reads auth state from AuthContext and renders appropriate nav links.
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Logs the user out and redirects to the homepage.
   */
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🍳 RecipeSearch
      </Link>
      <div className="navbar-links">
        {user ? (
          <>
            <span className="navbar-greeting">Hi, {user.name}</span>
            <Link to="/saved" className="navbar-link">
              Saved
            </Link>
            <Link to="/profile" className="navbar-link">
              Profile
            </Link>
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="navbar-link navbar-link--cta">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
