const mongoose = require('mongoose');
const { Schema } = mongoose;

// User schema definition
// This schema defines the structure of the User document in MongoDB
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);