const Attendance = require('../models/Attendance');
const Shift = require('../models/Shift');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Import the broadcast function from server.js
const { broadcastAttendanceUpdate } = require('../server');

const ALLOWED_IPS = ['80.217.249.6', '127.0.0.1', '1.2.3.4']; // Replace/add your allowed IPs

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
    const ipStatus = ALLOWED_IPS.includes(ip) ? 'allowed' : 'denied';
    const message = ipStatus === 'allowed' ? 'Yahoo' : 'very sad';

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

    // Broadcast the new attendance record
    broadcastAttendanceUpdate(attendance);

    // Send email alert if late
    if (status === 'late') {
      const employee = await User.findById(userId);
      const emailText = `Dear ${employee.firstName},\n\nYou were late for your shift on ${shift.date}. Please ensure timely attendance in the future.\n\nBest regards,\nHR Team`;
      await sendEmail(employee.email, 'Late Check-in Alert', emailText);
    }

    res.status(201).json({ message: 'Clock-in successful', attendance });
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

    // Broadcast the updated attendance record
    broadcastAttendanceUpdate(attendance);

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
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/export-excel
exports.exportAttendanceExcel = async (req, res) => {
  try {
    const { employeeId } = req.query;
    const records = await Attendance.find({ employee: employeeId }).populate('shift');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Clock In', key: 'clockIn', width: 15 },
      { header: 'Clock Out', key: 'clockOut', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'IP', key: 'ip', width: 18 },
      { header: 'IP Status', key: 'ipStatus', width: 10 },
    ];
    records.forEach((r) => {
      worksheet.addRow({
        date: r.shift ? r.shift.date.toISOString().slice(0, 10) : '',
        clockIn: r.clockIn ? r.clockIn.toLocaleTimeString() : '',
        clockOut: r.clockOut ? r.clockOut.toLocaleTimeString() : '',
        status: r.status,
        ip: r.ip,
        ipStatus: r.ipStatus,
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: 'Export failed' });
  }
};

// GET /api/attendance/export-pdf
exports.exportAttendancePDF = async (req, res) => {
  try {
    const { employeeId } = req.query;

    // Fetch attendance records for the employee
    const records = await Attendance.find({ employee: employeeId }).populate('shift');
    if (records.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this employee' });
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.pdf');
    doc.pipe(res);

    // Add title
    doc.fontSize(18).text('Attendance Report', { align: 'center' });
    doc.moveDown();

    // Add attendance records
    records.forEach((record) => {
      doc
        .fontSize(12)
        .text(
          `Date: ${record.shift ? record.shift.date.toISOString().slice(0, 10) : 'N/A'} | Clock In: ${
            record.clockIn ? record.clockIn.toLocaleTimeString() : 'N/A'
          } | Clock Out: ${record.clockOut ? record.clockOut.toLocaleTimeString() : 'N/A'} | Status: ${
            record.status || 'N/A'
          }`
        );
      doc.moveDown(0.5);
    });

    // Finalize the PDF
    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Export failed', error: err.message });
  }
};

exports.exportAllAttendancePDF = async (req, res) => {
  try {
    // Fetch attendance records for all employees
    const records = await Attendance.find().populate('employee shift');
    if (records.length === 0) {
      return res.status(404).json({ message: 'No attendance records found' });
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=all_attendance.pdf');
    doc.pipe(res);

    // Add title
    doc.fontSize(18).text('All Employees Attendance Report', { align: 'center' });
    doc.moveDown();

    // Add attendance records
    records.forEach((record) => {
      doc
        .fontSize(12)
        .text(
          `Employee: ${record.employee.firstName} ${record.employee.lastName} | Date: ${
            record.shift ? record.shift.date.toISOString().slice(0, 10) : 'N/A'
          } | Clock In: ${record.clockIn ? record.clockIn.toLocaleTimeString() : 'N/A'} | Clock Out: ${
            record.clockOut ? record.clockOut.toLocaleTimeString() : 'N/A'
          } | Status: ${record.status || 'N/A'}`
        );
      doc.moveDown(0.5);
    });

    // Finalize the PDF
    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Export failed', error: err.message });
  }
};
