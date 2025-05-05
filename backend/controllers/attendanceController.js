const Attendance = require('../models/Attendance');
const { Parser } = require('json2csv');
const sendEmail = require('../utils/emailService');


// Clock-In Controller with Late Check-In Alert
exports.clockIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().setHours(0, 0, 0, 0);

        const existingRecord = await Attendance.findOne({ user: userId, date: today });
        if (existingRecord) {
            return res.status(400).json({ message: 'You have already clocked in today.' });
        }

        const currentTime = new Date();
        const lateThreshold = new Date().setHours(9, 0, 0, 0); // Example: 9:00 AM

        const isLate = currentTime > lateThreshold;

        const attendance = new Attendance({
            user: userId,
            clockIn: currentTime,
            date: today,
            location: req.ip,
        });

        await attendance.save();

        // Send email notification if the user is late
        if (isLate) {
            const user = await User.findById(userId);
            const emailSubject = 'Late Check-In Notification';
            const emailBody = `Dear ${user.name},\n\nYou have checked in late at ${currentTime.toLocaleTimeString()}. Please ensure timely check-ins in the future.\n\nBest regards,\nAttendance System`;

            await sendEmail(user.email, emailSubject, emailBody);
        }

        const message = isLate
            ? 'Clock-in successful, but you are late. An email notification has been sent.'
            : 'Clock-in successful';

        res.status(201).json({ message, attendance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Clock-Out Controller
exports.clockOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().setHours(0, 0, 0, 0); // Start of today

        // Find the user's attendance record for today
        const attendance = await Attendance.findOne({ user: userId, date: today });
        if (!attendance) {
            return res.status(400).json({ message: 'You have not clocked in today.' });
        }

        if (attendance.clockOut) {
            return res.status(400).json({ message: 'You have already clocked out today.' });
        }

        // Update the clock-out time
        attendance.clockOut = new Date();
        attendance.location = req.ip; // Capture IP address during clock-out
        await attendance.save();

        res.status(200).json({ message: 'Clock-out successful', attendance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAttendance = async (req, res) => {
    const { userId, startDate, endDate, department } = req.query;
    try {
        const filter = {};

        if (userId) filter.user = userId;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const attendanceRecords = await Attendance.find(filter)
            .populate('user', 'name email department') // Populate user details
            .sort({ date: -1 });

        res.status(200).json({ attendanceRecords });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Export Attendance as CSV
exports.exportAttendance = async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find().populate('user', 'name email');
        const fields = ['user.name', 'user.email', 'clockIn', 'clockOut', 'date', 'location'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(attendanceRecords);

        res.header('Content-Type', 'text/csv');
        res.attachment('attendance.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};