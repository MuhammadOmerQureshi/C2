const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const Shift = require('../models/Shift');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// Run every day at 11:59 PM
cron.schedule('59 23 * * *', async () => {
  try {
    console.log('Running missed check-in job...');
    const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
    const shifts = await Shift.find({ date: today }).populate('employee');

    for (const shift of shifts) {
      const attendance = await Attendance.findOne({ shift: shift._id });
      if (!attendance) {
        // Mark as missed and send email
        const missedAttendance = await Attendance.create({
          shift: shift._id,
          employee: shift.employee._id,
          status: 'missed',
        });

        const emailText = `Dear ${shift.employee.firstName},\n\nYou missed your shift on ${shift.date}. Please contact your manager for further details.\n\nBest regards,\nHR Team`;
        await sendEmail(shift.employee.email, 'Missed Check-in Alert', emailText);
      }
    }
    console.log('Missed check-in job completed successfully.');
  } catch (error) {
    console.error('Error in missed check-in job:', error);
  }
});