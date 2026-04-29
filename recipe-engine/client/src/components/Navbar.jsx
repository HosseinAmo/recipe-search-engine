/**
 * @file Navbar.jsx
 * @description Top navigation bar with mobile hamburger menu.
 * @author Hossein
 * NEW FEATURES ADDED:
 *  - Mobile hamburger menu toggle
 *  - Active link highlighting
 *  - Closes menu on navigation
 */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const location            = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        🍳 RecipeSearch
      </Link>

      {/* NEW: Hamburger button for mobile */}
      <button
        className="navbar-hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        {user ? (
          <>
            <span className="navbar-greeting">Hi, {user.name.split(" ")[0]}</span>
            <Link to="/saved"   className={`navbar-link ${isActive("/saved")   ? "active" : ""}`} onClick={closeMenu}>♥ Saved</Link>

            {user.role === "admin" && (
              <Link 
                to="/admin"
                className={`navbar-link ${isActive("/admin") ? "active" : ""}`}
                onClick={closeMenu}
              >
                Admin
              </Link>    
            )}
            
            <Link to="/profile" className={`navbar-link ${isActive("/profile") ? "active" : ""}`} onClick={closeMenu}>Profile</Link>
            <button className="navbar-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"    className={`navbar-link ${isActive("/login")    ? "active" : ""}`} onClick={closeMenu}>Login</Link>
            <Link to="/register" className="navbar-link navbar-link--cta" onClick={closeMenu}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
