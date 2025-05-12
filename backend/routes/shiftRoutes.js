
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

// simple validation‐error middleware
const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

/**
 * Employer routes — all require JWT + “employer” role
 */
router.post(
  '/',
  protect,
  authorize('employer'),
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
    body('location').notEmpty().withMessage('Location is required'),
  ],
  validate,
  createShift
);

router.get(
  '/',
  protect,
  authorize('employer'),
  listShiftsForEmployer
);

router.put(
  '/:id',
  protect,
  authorize('employer'),
  [
    body('date').optional().isISO8601(),
    body('startTime').optional().notEmpty(),
    body('endTime').optional().notEmpty(),
    body('status').optional().isIn(['scheduled','completed','cancelled'])
  ],
  validate,
  updateShift
);

router.delete(
  '/:id',
  protect,
  authorize('employer'),
  deleteShift
);

/**
 * Employee route — view only your own shifts
 */
router.get(
  '/my',
  protect,
  authorize('employee'),
  listMyShifts
);

module.exports = router;








