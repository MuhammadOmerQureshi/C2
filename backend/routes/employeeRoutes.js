// routes/employeeRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

// Validation helper
const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

// All routes below require employer authentication
router.use(protect, authorize('employer'));

// Add employee (standardized endpoint)
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
  employeeController.createEmployee
);

// Add employee via /add endpoint (if needed)
// router.post('/add', employeeController.addEmployee);

// List all employees for employer
router.get('/', employeeController.listEmployees);

// Get one employee’s profile
router.get('/:id', employeeController.getEmployeeById);

// Update an employee
router.put(
  '/:id',
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validate,
  employeeController.updateEmployee
);

// Delete an employee
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;


