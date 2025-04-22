const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Basic route to test server
app.get('/', (req, res) => {
    res.send('Backend is running');
});
let server;

const PORT = process.env.PORT || 5000;
server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

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
