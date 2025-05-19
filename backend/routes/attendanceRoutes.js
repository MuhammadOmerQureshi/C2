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
  sendShiftReminder 
} = require('../controllers/attendanceController');

const router = express.Router();

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Clock in
router.post(
  '/clock-in',
  protect,
  authorize('employee'),
  body('shiftId').notEmpty().withMessage('Shift ID is required'),
  body('ip').optional().isString().withMessage('IP must be a string'),
  validate,
  clockIn
);

// Clock out
router.post(
  '/clock-out',
  protect,
  authorize('employee'),
  body('attendanceId').notEmpty().withMessage('Attendance ID is required'),
  validate,
  clockOut
);

// Get employee's attendance history - both endpoints for compatibility
router.get('/my-history', protect, authorize('employee'), listMyAttendance);
router.get('/history', protect, authorize('employee'), getAttendanceHistory);

// Export routes
router.get('/export-excel', protect, exportAttendanceExcel);
router.get('/export-pdf', protect, exportAttendancePDF);
router.get('/export-all-pdf', protect, authorize('admin', 'employer'), exportAllAttendancePDF);

// Send shift reminder
router.post('/send-shift-reminder', sendShiftReminder);

module.exports = router;
