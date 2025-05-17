// routes/attendanceRoutes.js

const attendanceController = require('../controllers/attendanceController');


const express = require('express');
const { body, validationResult } = require('express-validator');

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  clockIn,
  clockOut,
  listMyAttendance,
  exportAttendancePDF
} = require('../controllers/attendanceController');

const router = express.Router();

// validation helper
const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  next();
};

// Base protection for all routes
router.use(protect);

// Employee-only routes
router.post(
  '/clock-in',
  authorize('employee'),
  [
    body('shiftId').notEmpty().withMessage('Shift ID is required'),
    // optionally validate geo fields if you send them:
    // body('lat').isFloat(),
    // body('lng').isFloat()
  ],
  validate,
  clockIn
);

router.post(
  '/clock-out',
  authorize('employee'),
  [
    body('attendanceId').notEmpty().withMessage('Attendance record ID is required')
  ],
  validate,
  clockOut
);

// GET /api/attendance/my-history
router.get('/my-history', authorize('employee'), attendanceController.listMyAttendance);

// Routes accessible by employees, employers, and admins
router.get('/export/pdf', exportAttendancePDF);

// GET /api/attendance?employeeId=xxx (admin, employer, employee)
router.get('/', attendanceController.getAttendanceForEmployee);

module.exports = router;
