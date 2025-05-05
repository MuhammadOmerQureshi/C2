const Attendance = require('../models/Attendance');

// Clock-In Controller
exports.clockIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().setHours(0, 0, 0, 0); // Start of today

        // Check if the user has already clocked in today
        const existingRecord = await Attendance.findOne({ user: userId, date: today });
        if (existingRecord) {
            return res.status(400).json({ message: 'You have already clocked in today.' });
        }

        // Create a new attendance record
        const attendance = new Attendance({
            user: userId,
            clockIn: new Date(),
            date: today,
            location: req.ip, // Optional: Store IP address
        });

        await attendance.save();
        res.status(201).json({ message: 'Clock-in successful', attendance });
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
        await attendance.save();

        res.status(200).json({ message: 'Clock-out successful', attendance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};