const express = require("express");
const { body, validationResult } = require("express-validator");
const { loginUser, getMe, updateUserProfile, forgotPassword, resetPassword } = require("../controllers/authController"); // Added forgotPassword and resetPassword
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Validation helper
const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

// Public login
router.post(
  "/login",
  [ body("email").isEmail(), body("password").notEmpty() ],
  validate,
  loginUser
);

// Forgot password route
router.post(
  "/forgot-password",
  [ body("email").isEmail().withMessage("Valid email is required") ],
  validate,
  forgotPassword
);

// Reset password route
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  resetPassword
);

// Protected "me" routes
router.get("/me", protect, getMe);
router.put("/me", protect, updateUserProfile);

module.exports = router;

