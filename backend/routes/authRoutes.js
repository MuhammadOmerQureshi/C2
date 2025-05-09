const express = require('express');
const { body, validationResult } = require('express-validator');
const { loginUser, getMe, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Validation helper
const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginUser // Use the loginUser controller
);

// Protected "me" routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateUserProfile);

module.exports = router;

