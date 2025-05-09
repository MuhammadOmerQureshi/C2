// routes/shiftRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createShift,
  listShiftsForEmployer,
  listMyShifts,
  updateShift,
  deleteShift
} = require('../controllers/shiftController');

const router = express.Router();

// validation helper
const validate = (req, res, next) => {              // middleware to validate request body
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

/**
 * Employer routes (manage shifts)
 */
router.use(protect, authorize('employer'));

router.post(
  '/',
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),           
    body('date').isISO8601().withMessage('Valid date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
  ],
  validate,
  createShift
);

router.get('/', listShiftsForEmployer);

router.put(
  '/:id',
  [
    body('date').optional().isISO8601(),
    body('startTime').optional().notEmpty(),
    body('endTime').optional().notEmpty(),
    body('status').optional().isIn(['scheduled','completed','cancelled'])
  ],
  validate,
  updateShift
);

router.delete('/:id', deleteShift);

/**
 * Employee route (view own shifts)
 * Mounted here so we don’t need a separate router
 */
router.get('/my/shifts', authorize('employee'), listMyShifts);

module.exports = router;
