/**
 * @file AuthContext.jsx
 * @description React context for global auth state. Provides current user,
 *              login, logout, and register functions to all child components.
 * @author Hossein
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

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
      try {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch {
        // No valid session - user stays null
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  /**
   * Log in with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {object} API response data
   */
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  /**
   * Register a new account.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {object} API response data
   */
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  /**
   * Log the current user out and clear state.
   */
  const logout = async () => {
    await api.post('/auth/logout');
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
