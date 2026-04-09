const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const {
  register,
  login,
  logout,
  profile,
} = require("../controllers/authController");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, errors: errors.array() });
  next();
};

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters."),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Min 8 characters.")
      .matches(/[A-Z]/)
      .withMessage("Must contain an uppercase letter.")
      .matches(/[0-9]/)
      .withMessage("Must contain a number."),
  ],
  validate,
  register,
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  login,
);

router.post("/logout", logout);
router.get("/profile", profile);

module.exports = router;
