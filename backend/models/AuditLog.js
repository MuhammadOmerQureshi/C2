const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema({
    action: { type: String, required: true }, // e.g., "updateStatus", "deleteUser"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who performed the action
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User affected by the action
    timestamp: { type: Date, default: Date.now },
    details: { type: Object }, // Additional details about the action
});

module.exports = mongoose.model('AuditLog', auditLogSchema);