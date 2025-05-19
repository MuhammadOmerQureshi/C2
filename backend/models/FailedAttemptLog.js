const mongoose = require('mongoose');
const { Schema } = mongoose;

const failedAttemptLogSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  attemptTime: { type: Date, default: Date.now },
  ipAddress: { type: String, required: true },
  reason: { type: String, required: true }  
}, { timestamps: true });

module.exports = mongoose.model('FailedAttemptLog', failedAttemptLogSchema);
