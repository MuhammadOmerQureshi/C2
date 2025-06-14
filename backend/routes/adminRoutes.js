const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  registerEmployer,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,

} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

// All admin routes require auth + admin role, so we use the middleware here
router.use(protect, authorize('admin'));

// Create employer
router.post(
  '/employers',
  [ body('firstName').notEmpty(), body('lastName').notEmpty(), /* etc. */ ],
  validate,
  registerEmployer
);

// Manage users
router.get('/users', protect, authorize('admin'), getAllUsers);

router.get('/users/:id', getUserById);
router.put('/status', ...updateUserStatus);
router.delete('/users/:id', deleteUser);


module.exports = router;
