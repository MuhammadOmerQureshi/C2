// routes/attendanceRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  clockIn,
  clockOut,
  listMyAttendance
} = require('../controllers/attendanceController');

const router = express.Router();

// validation helper
const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

/**
 * All attendance routes require an authenticated employee
 */
router.use(protect, authorize('employee'));

// POST /api/attendance/clock-in
router.post(
  '/clock-in',
  [
    body('shiftId').notEmpty().withMessage('Shift ID is required'),
    // optionally validate geo fields if you send them:
    // body('lat').isFloat(),
    // body('lng').isFloat()
  ],
  validate,
  clockIn
);

// POST /api/attendance/clock-out
router.post(
  '/clock-out',
  [
    body('attendanceId').notEmpty().withMessage('Attendance record ID is required')
  ],
  validate,
  clockOut
);

// GET /api/attendance/my-history
router.get('/my-history', listMyAttendance);

module.exports = router;
