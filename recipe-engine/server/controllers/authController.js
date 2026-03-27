/**
 * @file authController.js
 * @description Handles user registration, login, logout, and profile retrieval.
 *              Issues a signed JWT stored as an httpOnly cookie on login.
 * @author Hossein
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * Generates a signed JWT for a given user ID.
 * @param {string} id - MongoDB user _id
 * @returns {string} Signed JWT string
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Sets the JWT as an httpOnly cookie on the response.
 * @param {object} res - Express response object
 * @param {string} token - JWT string
 */
const setTokenCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,          // Not accessible via JS - protects against XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',      // Protects against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  // Return validation errors from validateMiddleware
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with that email already exists.',
      });
    }

    // Hash password with bcrypt (salt rounds: 12)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user document
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Issue JWT and set as httpOnly cookie
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) console.error('Session regeneration error:', err);
      req.session.userId = user._id.toString();
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

/**
 * @desc    Login user and issue httpOnly JWT cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user and include password field (excluded by default in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password.',
      });
    }

    // Compare plain password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password.',
      });
    }

    // Issue JWT and set as httpOnly cookie
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Store userId in session for server-side session support
    req.session.regenerate((err) => {
      if (err) console.error('Session regeneration error:', err);
      req.session.userId = user._id.toString();
    });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

/**
 * @desc    Logout user - clears JWT cookie and destroys session
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = (req, res) => {
  // Clear the JWT httpOnly cookie
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  // Destroy the server-side session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @desc    Get the currently logged-in user's profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    // req.user is populated by the protect middleware
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getProfile };
