const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceLogSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clockInTime: { type: Date },
  clockOutTime: { type: Date },
  ipAddress: { type: String },
  verified: { type: Boolean },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
