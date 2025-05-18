const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
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

// Clock in - with IP verification
router.post(
  '/clock-in',
  protect,
  authorize('employee'),
  verifyEmployeeIP, // Apply IP verification middleware
  // Add validation rules here (example: require a location field)
  body('location').optional().isString().withMessage('Location must be a string'),
  validate, // Run validation
  async (req, res) => {
    try {
      // Get employee profile to find employer
      const employeeProfile = await EmployeeProfile.findOne({ user: req.user.id });
      if (!employeeProfile) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }

      // Check if there's an open attendance record
      const openAttendance = await AttendanceLog.findOne({
        employee: req.user.id,
        clockOutTime: null
      });

      if (openAttendance) {
        return res.status(400).json({ message: 'You already have an active clock-in session' });
      }

      // Create new attendance record
      const attendance = await AttendanceLog.create({
        employee: req.user.id,
        employer: employeeProfile.employer,
        clockInTime: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        verified: true,
        status: 'pending'
      });
      broadcastAttendanceUpdate(attendance);

      res.status(201).json({
        message: 'Clock-in successful',
        attendance
      });
    } catch (error) {
      console.error('Clock-in error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Clock out
router.post(
  '/clock-out',
  protect,
  authorize('employee'),
  async (req, res) => {
    try {
      // Find open attendance record
      const attendance = await AttendanceLog.findOne({
        employee: req.user.id,
        clockOutTime: null
      });

      if (!attendance) {
        return res.status(400).json({ message: 'No active clock-in session found' });
      }

      // Update with clock out time
      attendance.clockOutTime = new Date();
      await attendance.save();
      broadcastAttendanceUpdate(attendance);
      // Send email alert if late
      if (attendance.clockOutTime > attendance.expectedClockOutTime) {
        // Send email notification
        const employee = await EmployeeProfile.findOne({ user: req.user.id });
        const emailText = `Dear ${employee.firstName},\n\nYou clocked out late on ${attendance.clockOutTime}. Please ensure timely attendance in the future.\n\nBest regards,\nHR Team`;
        await sendEmail(employee.email, 'Late Clock-out Alert', emailText);
      }

      res.status(200).json({
        message: 'Clock-out successful',
        attendance
      });
    } catch (error) {
      console.error('Clock-out error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get employee's attendance history
router.get(
  '/history',
  protect,
  authorize('employee'),
  async (req, res) => {
    try {
      const attendanceHistory = await AttendanceLog.find({
        employee: req.user.id
      }).sort({ clockInTime: -1 });

      res.status(200).json(attendanceHistory);
    } catch (error) {
      console.error('Attendance history error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get employer's employee attendance records
router.get(
  '/employer/records',
  protect,
  authorize('employer'),
  async (req, res) => {
    try {
      const attendanceRecords = await AttendanceLog.find({
        employer: req.user.id
      })
        .populate('employee', 'firstName lastName username')
        .sort({ clockInTime: -1 });

      res.status(200).json(attendanceRecords);
    } catch (error) {
      console.error('Employer attendance records error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
