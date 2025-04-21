// models/EmployeeProfile.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeProfileSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId:  { type: String, required: true, unique: true },
  contact:     { type: String },
  employer:    { type: Schema.Types.ObjectId, ref: 'User', required: true }  // link back to the employer
}, { timestamps: true });

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);
