const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { 
    type: String, 
    enum: ['admin', 'employer', 'employee'], 
    default: 'employee' 
  },
  status:    { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  lastLogin: { type: Date }, // Timestamp for the last login
  phoneNumber: { type: String }, // Optional phone number
  address: { type: String }, // Optional address
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);