const mongoose = require('mongoose');
const { Schema } = mongoose;

const ipRangeSchema = new Schema({
  name: { type: String, required: true },  // Descriptive name (e.g., "Office Network", "Remote Location 1")
  startIP: { type: String, required: true },  // Start of IP range
  endIP: { type: String, required: true },    // End of IP range (can be same as startIP for single IP)
  active: { type: Boolean, default: true },   // Whether this range is currently active
  createdAt: { type: Date, default: Date.now }
});

const employerSettingsSchema = new Schema({
  employer: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  approvedIPRanges: [ipRangeSchema],
  enforceIPVerification: { type: Boolean, default: true },  // Toggle for enabling/disabling verification
}, { timestamps: true });

module.exports = mongoose.model('EmployerSettings', employerSettingsSchema);
