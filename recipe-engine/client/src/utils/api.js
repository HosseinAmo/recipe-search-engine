/**
 * @file api.js
 * @description Configured Axios instance for all API calls.
 *              withCredentials: true ensures the httpOnly JWT cookie
 *              is sent automatically with every request.
 * @author Hossein
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Send cookies (JWT) with every request
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
