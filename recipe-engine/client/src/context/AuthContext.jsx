/**
 * @file AuthContext.jsx
 * @description React context for global auth state.
 *              Uses backend express-session cookie to keep users logged in.
 * @author Hossein
 */

import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore logged-in user after refresh using backend session cookie
  useEffect(() => {
  const restoreSession = async () => {
    try {
      const res = await api.get("/auth/profile");

      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  restoreSession();
}, []);

  // Login user and store session on backend
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    if (res.data.success) {
      setUser(res.data.user);
    }

    return res.data;
  };

  // Register user and store session on backend
  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });

    if (res.data.success) {
      setUser(res.data.user);
    }

    return res.data;
  };

  // Logout user and destroy backend session
  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
