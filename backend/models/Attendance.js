// models/Attendance.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  employee:   { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  shift:      { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
  clockIn:    { type: Date },
  clockOut:   { type: Date },
  status:     { 
    type: String, 
    enum: ['ontime','late','absent'], 
    default: 'ontime' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
