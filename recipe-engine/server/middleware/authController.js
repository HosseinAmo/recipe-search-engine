// LOGIN — replace the jwt.sign / res.cookie block with this:
req.session.userId = user._id;
req.session.role   = user.role;

res.status(200).json({
  success: true,
  message: "Logged in successfully.",
  user: {
    _id:   user._id,
    name:  user.name,
    email: user.email,
    role:  user.role,
  },
});
