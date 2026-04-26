/**
 * @file AuthContext.jsx
 * @description React context for global auth state. Provides current user,
 *              login, logout, and register functions to all child components.
 *              Uses js-cookie to persist a client-side auth token alongside
 *              the server-side httpOnly session cookie.
 * @author Hossein
 */
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "../utils/api";

const AuthContext = createContext(null);

// Cookie config
const TOKEN_COOKIE = "auth_token";
const COOKIE_OPTIONS = {
  expires: 7,        // days
  secure: true,      // HTTPS only
  sameSite: "Strict",
};

/**
 * AuthProvider wraps the app and exposes auth state via context.
 * On mount it checks the /api/auth/profile endpoint to restore
 * the session from the existing httpOnly cookie.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page load by checking the JWT cookie
  useEffect(() => {
    const restoreSession = async () => {
      // Only attempt restore if we have a client-side token cookie
      const token = Cookies.get(TOKEN_COOKIE);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/profile");
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          // Server rejected the session — clear the stale cookie
          Cookies.remove(TOKEN_COOKIE);
        }
      } catch {
        // No valid session - clear cookie and leave user as null
        Cookies.remove(TOKEN_COOKIE);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Log in with email and password.
   * Persists the returned token in a client-side cookie.
   * @param {string} email
   * @param {string} password
   * @returns {object} API response data
   */
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      // Store the token returned by the server in a cookie
      if (res.data.token) {
        Cookies.set(TOKEN_COOKIE, res.data.token, COOKIE_OPTIONS);
      }
    }
    return res.data;
  };

  /**
   * Register a new account.
   * Persists the returned token in a client-side cookie.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {object} API response data
   */
  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    if (res.data.success) {
      setUser(res.data.user);
      if (res.data.token) {
        Cookies.set(TOKEN_COOKIE, res.data.token, COOKIE_OPTIONS);
      }
    }
    return res.data;
  };

  /**
   * Log the current user out, clear state, and remove the auth cookie.
   */
  const logout = async () => {
    await api.post("/auth/logout");
    Cookies.remove(TOKEN_COOKIE);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for consuming the AuthContext.
 * @returns {{ user, loading, login, register, logout }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
