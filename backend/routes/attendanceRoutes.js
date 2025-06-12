// routes/attendanceRoutes.js

const attendanceController = require('../controllers/attendanceController');


const express = require('express');
const { body, validationResult } = require('express-validator');

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  clockIn,
  clockOut,
  listMyAttendance,
  getAttendanceHistory,
  exportAttendanceExcel,
  exportAttendancePDF,
  exportAllAttendancePDF,
  sendShiftReminder,
  getAttendanceForEmployer,
  getAttendanceForEmployee
} = require('../controllers/attendanceController');
const { verifyEmployeeIP } = require('../middleware/ipVerificationMiddleware');
const AttendanceLog = require('../models/AttendanceLog');
const EmployeeProfile = require('../models/EmployeeProfile');
const { broadcastAttendanceUpdate } = require('../server');

const router = express.Router();

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Base protection for all routes
router.use(protect);

// Employee-only routes
router.post(
  '/clock-in',
  authorize('employee'),
  verifyEmployeeIP,
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
// router.get('/export/excel', exportAttendanceExcel);

// GET /api/attendance?employeeId=xxx (admin, employer, employee)
router.get(
  '/',
  authorize('admin', 'employer'),
  async (req, res, next) => {
    if (req.query.employerId) {
      return getAttendanceForEmployer(req, res, next);
    }
    if (req.query.employeeId) {
      return getAttendanceForEmployee(req, res, next);
    }
    return res.status(400).json({ message: 'Missing employerId or employeeId in query' });
  }
);

module.exports = router;
