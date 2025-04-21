const mongoose = require('mongoose');
const { Schema } = mongoose;

const shiftSchema = new Schema({
  employee:   { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  date:       { type: Date, required: true },
  startTime:  { type: String, required: true },  // e.g. '08:00'
  endTime:    { type: String, required: true },  // e.g. '17:00'
  status:     { 
    type: String, 
    enum: ['scheduled','completed','cancelled'], 
    default: 'scheduled' 
  },
  location:   { type: String, required: true }  // e.g. 'Office'
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);