// models/Attendance.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  employee:   { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  shift:      { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  clockIn:    { type: Date },
  clockOut:   { type: Date },
  date: { type: Date, required: true }, // Date of the attendance record
  location: { type: String },
  status:     { 
    type: String, 
    enum: ['ontime','late','absent'], 
    default: 'ontime' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
