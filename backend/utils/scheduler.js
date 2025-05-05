const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const sendEmail = require('./emailService');

// Schedule a job to run at 10:00 AM every day
cron.schedule('0 10 * * *', async () => {
    try {
        const today = new Date().setHours(0, 0, 0, 0);

        // Find users who have not clocked in today
        const users = await User.find({ role: 'employee' });
        for (const user of users) {
            const attendance = await Attendance.findOne({ user: user._id, date: today });
            if (!attendance) {
                const emailSubject = 'Missed Check-In Notification';
                const emailBody = `Dear ${user.name},\n\nYou have not checked in today. Please ensure timely check-ins to avoid issues.\n\nBest regards,\nAttendance System`;

                await sendEmail(user.email, emailSubject, emailBody);
            }
        }

        console.log('Missed check-in notifications sent.');
    } catch (error) {
        console.error(`Error sending missed check-in notifications: ${error.message}`);
    }
});