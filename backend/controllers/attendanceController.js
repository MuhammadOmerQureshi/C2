const Attendance = require('../models/Attendance');
const Shift = require('../models/Shift');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile'); // Make sure path is correct

const PDFDocument = require('pdfkit'); 

const ALLOWED_IPS = ['80.217.249.6','127.0.0.1', '1.2.3.4']; // Replace/add your allowed IPs

// Helper: map attendance with hoursWorked
function mapAttendance(records) {
  return records.map(r => {
    let hoursWorked = null;
    if (r.clockIn && r.clockOut) {
      hoursWorked = Math.round(((r.clockOut - r.clockIn) / (1000 * 60 * 60)) * 100) / 100;
    }
    // Normalize status for frontend
    let status = r.status;
    if (status === 'ontime') status = 'Present';
    else if (status === 'late') status = 'Late';
    else if (status === 'absent' || status === 'missed') status = 'Absent';
    return {
      _id: r._id,
      date: r.clockIn || r.createdAt,
      status,
      clockIn: r.clockIn,
      clockOut: r.clockOut,
      hoursWorked,
    };
  });
}

// POST /api/attendance/clock-in
exports.clockIn = async (req, res) => {
  try {
    const { shiftId, ip } = req.body;       // IP address of the employee
    const userId = req.user.id;

    // Find the shift for this employee
    const shift = await Shift.findOne({ _id: shiftId, employee: userId });
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    // Prevent double clock-in
    const existing = await Attendance.findOne({ shift: shiftId, employee: userId, clockOut: null });
    if (existing) return res.status(400).json({ message: 'Already clocked in for this shift' });

    // Compare IP
    const ipStatus = ALLOWED_IPS.includes(ip) ? 'allowed' : 'denied';
    const message = ipStatus === 'allowed' ? 'Ip validation successful!' : 'Ip verification failed. Please contact your employer';

    // Save attendance 12
    const attendance = await Attendance.create({
      shift: shiftId,
      employee: userId,
      clockIn: new Date(),
      ip,
      ipStatus,
    });

    res.status(201).json({ message, attendance });
  } catch (err) {
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

    res.status(200).json({ message: 'Clocked out', attendance });
  } catch (err) {
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
    res.status(200).json(mapAttendance(records));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/export/pdf
exports.exportAttendancePDF = async (req, res) => {
  try {
    console.log('PDF export endpoint hit, user:', req.user, 'employeeId:', req.query.employeeId);

    const { employeeId } = req.query;

    // Check if user is authenticated
    if (!req.user || !req.user.id || !req.user.role) {
      console.error('Missing authentication data:', req.user);
      return res.status(401).json({ message: 'Authentication required. Please log in again.' });
    }

    const userRole = req.user.role;
    const userId = req.user.id;

    if (!employeeId) return res.status(400).json({ message: 'employeeId required' });

    // Check if the employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      console.log(`Employee not found: ${employeeId}`);
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if the employee has a profile
    const empProfile = await EmployeeProfile.findOne({ user: employeeId }); // Ensure this path is correct
    if (!empProfile) {
      console.log(`No profile found for employee: ${employeeId}`);
      return res.status(403).json({ message: 'Forbidden: No profile found for employee.' });
    }

    // Debug: log the context, user, and employee
    console.log('--- PDF EXPORT ATTEMPT ---');s

    console.log('Requester:', userRole, userId);
    console.log('Employee:', employeeId, employee.firstName, employee.lastName);

    // Employees can only export their own records
    if (userRole === 'employee' && userId !== employeeId) {
      console.log('403 - Employee trying to export another employee');
      return res.status(403).json({ message: 'Forbidden: You can only export your own attendance records.' });
    }

    // Employers: must own this employee (via EmployeeProfile)
    if (userRole === 'employer') {
      if (String(empProfile.employer) !== String(userId)) {
        console.log(`Employee belongs to different employer: ${empProfile.employer}`);
        return res.status(403).json({ message: 'Forbidden: You can only export attendance of your own employees.' });
      }
    }

    // Admins: no restrictions

    // Add these headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // --- Existing PDF generation logic below (unchanged) ---
    // Get all shifts for this employee
    const shifts = await Shift.find({ employee: employeeId }).sort({ date: 1 });

    // Get all attendance records for this employee
    const attendanceMap = {};
    const attendanceRecords = await Attendance.find({ employee: employeeId });
    attendanceRecords.forEach(a => {
      attendanceMap[a.shift?.toString()] = a;
    });

    // Prepare PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${employee.firstName}_${employee.lastName}_attendance.pdf`);
    doc.pipe(res);

    // Employee name at top
    doc.fontSize(20).text(`${employee.firstName} ${employee.lastName} - Attendance & Shifts`, { align: 'center' });
    doc.moveDown();

    // Table header
    doc.fontSize(14).text(
      'Date        Start    End      Location      Status      Clock In    Clock Out    IP      IP Status',
      { underline: true }
    );
    doc.moveDown(0.5);

    // Table rows
    shifts.forEach(shift => {
      const a = attendanceMap[shift._id.toString()];
      doc.fontSize(12).text(
        `${shift.date?.toISOString().slice(0,10) || ''}   ` +
        `${shift.startTime || ''}   ${shift.endTime || ''}   ${shift.location || ''}   ` +
        `${a ? a.status : 'scheduled'}   ` +
        `${a && a.clockIn ? new Date(a.clockIn).toLocaleTimeString() : ''}   ` +
        `${a && a.clockOut ? new Date(a.clockOut).toLocaleTimeString() : ''}   ` +
        `${a?.ip || ''}   ${a?.ipStatus || ''}`
      );
      doc.moveDown(0.3);
    });

    doc.end();
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).send(`<h1>Export failed</h1><pre>${err.message}</pre>`);
  }
};

// GET /api/attendance?employeeId=xxx
exports.getAttendanceForEmployee = async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.status(400).json({ message: 'employeeId required' });

    // Only allow: admin, employer (of this employee), or the employee themselves
    const userRole = req.user.role;
    const userId = req.user.id;

    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Check employer ownership if employer
    if (userRole === 'employer') {
      const EmployeeProfile = require('../models/EmployeeProfile');
      const empProfile = await EmployeeProfile.findOne({ user: employeeId });
      if (!empProfile || String(empProfile.employer) !== String(userId)) {
        return res.status(403).json({ message: 'Forbidden: Not your employee.' });
      }
    }
    // Employee can only see their own
    if (userRole === 'employee' && userId !== employeeId) {
      return res.status(403).json({ message: 'Forbidden: Not your attendance.' });
    }

    // Fetch attendance records
    const records = await Attendance.find({ employee: employeeId }).sort({ date: 1 });
    res.json(mapAttendance(records));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
