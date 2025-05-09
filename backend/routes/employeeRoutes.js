// routes/employeeRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

const router = express.Router();

// validation helper
const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

/**
 * Employer endpoints (must be logged in as role='employer')
 */
router.use(protect, authorize('employer'));

// POST /api/employees      → create employee profile
router.post(
  '/',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
  ],
  validate,
  createEmployee
);

// GET /api/employees       → list all employees under this employer
router.get('/', listEmployees);

// GET /api/employees/:id   → get one employee’s profile
router.get('/:id', getEmployeeById);

// PUT /api/employees/:id   → update an employee’s profile
router.put(
  '/:id',
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validate,
  updateEmployee
);

// DELETE /api/employees/:id → delete an employee profile
router.delete('/:id', deleteEmployee);

module.exports = router;

