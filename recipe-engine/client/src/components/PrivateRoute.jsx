/**
 * @file PrivateRoute.jsx
 * @description Wraps protected routes. Redirects to /login if no user session.
 *              Shows a loading state while session is being restored from cookie.
 * @author Hossein
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PrivateRoute component.
 * @param {object} props
 * @param {React.ReactNode} props.children - The protected page to render
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for session restore before deciding to redirect
  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
