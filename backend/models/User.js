
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { 
    type: String, 
    enum: ['admin','employer','employee'], 
    default: 'employee' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
// This code defines a Mongoose schema for a User model in a Node.js application.
// The schema includes fields for name, email, password, and role, with validation rules.       
// The role field has a default value of 'employee' and can only be one of the specified values.
// The schema also includes timestamps for createdAt and updatedAt fields.
// Finally, the schema is exported as a Mongoose model named 'User' for use in other parts of the application.
// This model can be used to interact with the users collection in a MongoDB database.

// The application is set up to use environment variables for configuration, and includes middleware for JSON parsing and CORS handling.
