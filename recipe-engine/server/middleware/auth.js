/**
 * Middleware: requires a logged-in session.
 * Attaches req.user = { _id, name, email } if authenticated.
 */
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated." });
  }
  req.user = {
    _id: req.session.userId,
    name: req.session.userName,
    email: req.session.userEmail,
  };
  next();
}

module.exports = { requireAuth };
