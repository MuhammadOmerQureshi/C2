// models/Admin.js
// (uses the same underlying collection as User via a discriminator)
const mongoose = require('mongoose');
const User = require('./User');

// create an empty schema—admins don’t need extra fields beyond User
const adminSchema = new mongoose.Schema({}, { _id: false });
module.exports = User.discriminator('Admin', adminSchema);
