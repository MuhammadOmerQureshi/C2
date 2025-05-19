const Attendance = require('../models/Attendance');
const Shift = require('../models/Shift');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const generateICS = require('../utils/calendar');
const sendEmail = require('../utils/email');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');

// Import the broadcast function from server.js if needed
// const { broadcastAttendanceUpdate } = require('../server');

const ALLOWED_IPS = ['80.217.249.6', '127.0.0.1', '1.2.3.4', '::1']; // Added ::1 for localhost IPv6

// POST /api/attendance/clock-in
exports.clockIn = async (req, res) => {
  try {
    const { shiftId, ip } = req.body; // IP address of the employee
    const userId = req.user.id;

    // Find the shift for this employee
    const shift = await Shift.findOne({ _id: shiftId, employee: userId });
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    // Prevent double clock-in
    const existing = await Attendance.findOne({ shift: shiftId, employee: userId, clockOut: null });
    if (existing) return res.status(400).json({ message: 'Already clocked in for this shift' });

    // Compare IP
    const ipStatus = ALLOWED_IPS.includes(ip) ? 'ALLOWED' : 'DENIED';
    const message = ipStatus === 'ALLOWED' ? 'IP Validation Successful' : 'IP Validation Failed';
    console.log('Clock-in IP:', ip, 'Message:', message); // Add this for debugging

    // Check if the clock-in is late
    const now = new Date();
    const shiftStartTime = new Date(`${shift.date}T${shift.startTime}`);
    const status = now > shiftStartTime ? 'late' : 'ontime';

    // Save attendance
    const attendance = await Attendance.create({
      shift: shiftId,
      employee: userId,
      clockIn: now,
      status,
      ip,
      ipStatus,
    });

    // Broadcast the new attendance record if needed
    // broadcastAttendanceUpdate(attendance);

    // Send email alert if late
    if (status === 'late') {
      const employee = await User.findById(userId);
      const emailText = `Dear ${employee.firstName},\n\nYou were late for your shift on ${shift.date}. Please ensure timely attendance in the future.\n\nBest regards,\nHR Team`;
      await sendEmail(employee.email, 'Late Check-in Alert', emailText);
    }

    res.status(201).json({ message, attendance }); // Make sure message is sent
  } catch (err) {
    console.error('Clock-in error:', err); // Add this line
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/attendance/clock-out
exports.clockOut = async (req, res) => {
  try {
    const { attendanceId } = req.body;
    const userId = req.user.id;

    const attendance = await Attendance.findOne({ _id: attendanceId, employee: userId });
    if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });
    if (attendance.clockOut) return res.status(400).json({ message: 'Already clocked out' });

    attendance.clockOut = new Date();
    await attendance.save();

    // Broadcast the updated attendance record if needed
    // broadcastAttendanceUpdate(attendance);

    res.status(200).json({ message: 'Clocked out', attendance });
  } catch (err) {
    console.error('Clock-out error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/my-history
exports.listMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await Attendance.find({ employee: userId })
      .populate('shift')
      .sort({ clockIn: -1 });
    res.status(200).json(records);
  } catch (err) {
    console.error('Attendance history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/history - Alias for my-history for compatibility
exports.getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await Attendance.find({ employee: userId })
      .populate('shift')
      .sort({ clockIn: -1 });
    res.status(200).json(records);
  } catch (err) {
    console.error('Attendance history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export functions remain the same
exports.exportAttendanceExcel = async (req, res) => {
  // Implementation remains the same
};

exports.exportAttendancePDF = async (req, res) => {
  // Implementation remains the same
};

exports.exportAllAttendancePDF = async (req, res) => {
  // Implementation remains the same
};

exports.sendShiftReminder = async (req, res) => {
  // Implementation remains the same
};
