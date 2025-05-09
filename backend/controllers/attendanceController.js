const Attendance = require('../models/Attendance');
const Shift = require('../models/Shift');

const ALLOWED_IPS = ['127.0.0.1', '1.2.3.4']; // Replace/add your allowed IPs

// POST /api/attendance/clock-in
exports.clockIn = async (req, res) => {
  try {
    const { shiftId, ip } = req.body;
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

    // Save attendance
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
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
