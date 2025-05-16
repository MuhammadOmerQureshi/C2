const mongoose = require("mongoose");
// Import mongoose to use its Schema constructor
// Define the PasswordResetToken schema
const passwordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);