/**
 * @file auth.js
 * @description Authentication routes: register, login, logout, profile
 * @author Hossein
 */

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getProfile } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegister, registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and set httpOnly JWT cookie
 * @access  Public
 */
router.post('/login', validateLogin, loginUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear JWT cookie
 * @access  Private
 */
router.post('/logout', protect, logoutUser);

/**
 * @route   GET /api/auth/profile
 * @desc    Get logged-in user's profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

module.exports = router;
