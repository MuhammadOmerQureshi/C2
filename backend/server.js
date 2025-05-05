const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
require('./utils/scheduler'); // Import the scheduler for periodic tasks

// 2. Route imports
const authRoutes = require('./routes/authRoutes');
/*
const employerRoutes   = require('./routes/employerRoutes');
const employeeRoutes   = require('./routes/employeeRoutes');
const shiftRoutes      = require('./routes/shiftRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
*/


// 3. App setup
const app = express();

// Middleware
app.use(express.json());  // parse JSON bodies
app.use(cors());          // enable CORS for all origins

// Mount routers
app.use('/api/auth', authRoutes);
/*
app.use('/api/employers',  employerRoutes);
app.use('/api/employees',  employeeRoutes);
app.use('/api/shifts',     shiftRoutes);
app.use('/api/attendance', attendanceRoutes);
*/

// 4. Health-check & 404
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB')) // Log successful connection
  .catch((error) => console.error('MongoDB connection error:', error)); // Log connection errors

let server;
// 5. Database connection & server start
const PORT = process.env.PORT || 5000;
server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Function to handle graceful shutdown of the server and database connection
function shutdown() {
    console.log('Shutting down server...');
    server.close(async () => { // Close the HTTP server
      console.log('HTTP server closed.');
      try {
        await mongoose.connection.close(); // Close the MongoDB connection
        console.log('MongoDB connection closed.');
        process.exit(0); // Exit the process with success code
      } catch (error) {
        console.error('Error closing MongoDB connection:', error); // Log any errors during shutdown
        process.exit(1); // Exit the process with error code
      }
    });
  }
  
  // Handle termination signals (e.g., Ctrl+C or system termination)
  process.on('SIGINT', shutdown); // Handle Ctrl+C
  process.on('SIGTERM', shutdown); // Handle termination signals from the system
