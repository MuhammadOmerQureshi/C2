const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName:   { type: String, required: true },
  lastName:    { type: String, required: true },
  username:    { type: String, required: true, unique: true },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },        // will store hashed
  address:     { type: String },
  contactNo:   { type: String },
  
  employerId:  { type: String, unique: true, sparse: true }, // Add this line

  role:      { type: String, enum: ['admin', 'employer', 'employee'], required: true }, 
  status:    { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active'},
  lastLogin: { type: Date }, // Timestamp for the last login
  phoneNumber: { type: String }, // Optional phone number
  address: { type: String }, // Optional address
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
