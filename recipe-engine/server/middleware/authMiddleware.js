/**
 * @file authMiddleware.js
 * @description JWT verification middleware. Reads the token from the httpOnly
 *              cookie, verifies it, and attaches the decoded user to req.user.
 * @author Hossein
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: protect
 * Verifies the JWT from the httpOnly cookie and attaches the user to req.user.
 * Returns 401 if no token is present or the token is invalid/expired.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorised. Please log in.',
    });
  }

  try {
    // Verify the token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user document to the request (excluding password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    req.user = user;

    // Refresh the cookie expiry on activity (sliding session)
    const freshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.cookie('jwt', freshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
    });
  }
};

/**
 * Middleware: optionalAuth
 * Like protect, but does not reject requests without a token.
 * If a valid token is present it attaches req.user; otherwise continues.
 * Used on public routes that behave differently when logged in (e.g. isSaved).
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.jwt;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch {
    // Invalid token — just continue without user
  }
  next();
};

module.exports = { protect, optionalAuth };
