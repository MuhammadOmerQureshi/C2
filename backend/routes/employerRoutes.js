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

// Employer dashboard route (with middleware)
router.get('/dashboard', protect, authorize('employer'), employerController.getDashboard);

// Employees CRUD (with middleware, no overlap)
router.post('/employees', protect, authorize('employer'), createEmployee);
router.get('/employees', protect, authorize('employer'), listEmployees);
router.put('/employees/:id', protect, authorize('employer'), updateEmployee);
router.delete('/employees/:id', protect, authorize('employer'), deleteEmployee);

// Existing routes (no overlap with /employees)
router.post(
  '/',
  [ body('firstName').notEmpty(), /* etc. */ ],
  validate,
  createEmployee
);
router.get('/', listEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', /* validators */ validate, updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;





