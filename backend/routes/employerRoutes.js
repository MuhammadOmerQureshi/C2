const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

// Only employers
router.use(protect, authorize('employer'));

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

