const mongoose = require('mongoose');
const { Schema } = mongoose;

// User schema definition
// This schema defines the structure of the User document in MongoDB
const userSchema = new Schema({
  firstName:   { type: String, required: true },
  lastName:    { type: String, required: true },
  username:    { type: String, required: true, unique: true },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },        // will store hashed
  address:     { type: String },
  contactNo:   { type: String },
  employeeId:  { type: String, unique: true, sparse: true },
  role: { 
      type: String, 
      enum: ['admin', 'employer', 'employee'], 
      default: 'employee' 
  },
  // Role can be 'admin', 'employer', or 'employee'
  // Default role is 'employee'
  status: { 
      type: String, 
      enum: ['active', 'inactive', 'suspended'], 
      default: 'active' 
  },
  // Status can be 'active', 'inactive', or 'suspended'
  // Default status is 'active'
  department: { type: String }, // New field for department
  phoneNumber: { type: String }, // Optional phone number
  lastLogin: { type: Date }, // Timestamp for the last login
  address: { type: String }, // Optional address field
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);