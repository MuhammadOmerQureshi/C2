const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  clockIn,
  clockOut,
  listMyAttendance,
  exportAttendanceExcel,
  exportAttendancePDF
} = require('../controllers/attendanceController');
const { broadcastAttendanceUpdate } = require('../server'); // adjust path if needed
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
    // body('lat').isFloat(),
    // body('lng').isFloat()
  ],
  validate,
  async (req, res) => {
    const { shiftId } = req.body;
    const attendance = await Attendance.create({
      user: req.user._id,
      shift: shiftId,
      // Add other fields if needed
    });

    broadcastAttendanceUpdate(attendance);

    res.json(attendance);
  }
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

// GET /api/attendance/export/excel
router.get('/export/excel', exportAttendanceExcel);

// GET /api/attendance/export/pdf
router.get('/export/pdf', exportAttendancePDF);

module.exports = router;
