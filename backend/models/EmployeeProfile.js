const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeProfileSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId:  { type: String, required: true, unique: true },
  contact:     { type: String },
  employer: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);
// This code defines a Mongoose schema for an EmployeeProfile model in a Node.js application.
// The schema includes fields for user (linking to the User model), employeeId, contact information, and a reference to the employer.
// The schema also includes timestamps for createdAt and updatedAt fields.



