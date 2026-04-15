/**
 * @file authMiddleware.js
 * @description Session-based auth middleware with optional JWT cookie fallback.
 *              Uses express-session as the primary auth mechanism (required by brief).
 *              Also includes RBAC requireRole middleware.
 * @author Hossein
 */
const User = require("../models/User");

/**
 * Middleware: protect
 * Checks req.session.userId to verify the user is logged in.
 * Attaches the user document to req.user for downstream use.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
  // Check session first (primary auth mechanism)
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Not authorised. Please log in.",
    });
  }
  try {
    // Attach the user document to the request (excluding password)
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

/**
 * Middleware: optionalAuth
 * Does not reject unauthenticated requests.
 * If a valid session exists, attaches req.user; otherwise continues.
 * Used on public routes that behave differently when logged in.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const optionalAuth = async (req, res, next) => {
  if (!req.session || !req.session.userId) return next();
  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (user) req.user = user;
  } catch {
    // Invalid session — continue without user
  }
  next();
};

/**
 * Middleware: requireRole
 * RBAC check — must be used AFTER protect middleware.
 * Rejects the request if the logged-in user's role is not in the allowed list.
 *
 * @param {...string} roles - Allowed roles e.g. requireRole("admin")
 * @returns {function} Express middleware function
 *
 * @example
 * router.delete("/:id", protect, requireRole("admin"), deleteRecipe);
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, requireRole };
