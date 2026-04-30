/**
 * @file api.js
 * @description Configured Axios instance for all API calls.
 *              withCredentials: true ensures the httpOnly JWT cookie
 *              is sent automatically with every request.
 * @author Hossein
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://recipe-search-engine-c6j5.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config?.url?.includes("/auth/profile");
    const isAlreadyOnLogin = window.location.pathname === "/login";
    const isPublicRoute = ["/", "/search", "/recipes"].some((p) =>
      window.location.pathname.startsWith(p)
    );

    if (
      error.response?.status === 401 &&
      !isAuthCheck &&
      !isAlreadyOnLogin &&
      !isPublicRoute
    ) {
      window.location.href = "/login?expired=true";
    }
    return Promise.reject(error);
  }
);

export default api;
