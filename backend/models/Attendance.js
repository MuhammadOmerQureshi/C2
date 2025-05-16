const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  employee:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shift:      { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
  clockIn:    { type: Date },
  clockOut:   { type: Date },
  status:     { type: String, enum: ['ontime','late','absent','missed'], default: 'ontime' },
  ip:         { type: String }, // to store the IP address
  ipStatus:   { type: String, enum: ['ALLOWED', 'DENIED'] } // to store if IP is allowed
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
