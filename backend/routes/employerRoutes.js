const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const employerController = require('../controllers/employerController');


const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

// Employer dashboard
router.get('/dashboard', protect, authorize('employer'), employerController.getDashboard);

// Employee CRUD (all protected and authorized)
router.post(
  '/employees',
  ...[
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('contact').optional().isString().withMessage('Contact must be a string'),
    // Add any other validators you use in employeeRoutes.js
  ],
  validate,
  protect,
  authorize('employer'),
  createEmployee
);

// List all employees for the authenticated employer
router.get('/employees', protect, authorize('employer'), listEmployees);
router.get('/employees/:id', protect, authorize('employer'), getEmployeeById);

router.put(
  '/employees/:id',
  ...[
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('username').optional().notEmpty().withMessage('Username cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('employeeId').optional().notEmpty().withMessage('Employee ID cannot be empty'),
    body('contact').optional().isString().withMessage('Contact must be a string'),
    // Add any other update validators as needed
  ],
  validate,
  protect,
  authorize('employer'),
  updateEmployee
);

router.delete('/employees/:id', protect, authorize('employer'), deleteEmployee);

module.exports = router;


