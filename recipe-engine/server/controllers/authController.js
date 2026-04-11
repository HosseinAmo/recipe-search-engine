const User = require('../models/User');

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    const user = await User.create({ name, email, passwordHash: password });

    // Start session
    req.session.userId    = user._id;
    req.session.userName  = user.name;
    req.session.userEmail = user.email;

    return res.status(201).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    req.session.userId    = user._id;
    req.session.userName  = user.name;
    req.session.userEmail = user.email;

    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: 'Logged out.' });
  });
}

// GET /api/auth/profile
async function profile(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { register, login, logout, profile };
