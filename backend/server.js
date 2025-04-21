// backend/server.js

// 1. Module imports & config
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 2. Route imports
const authRoutes       = require('./routes/authRoutes');
const employerRoutes   = require('./routes/employerRoutes');
const employeeRoutes   = require('./routes/employeeRoutes');
const shiftRoutes      = require('./routes/shiftRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

// 3. App setup
const app = express();

// Middleware
app.use(express.json());  // parse JSON bodies
app.use(cors());          // enable CORS for all origins

// Mount routers
app.use('/api/auth',       authRoutes);
app.use('/api/employers',  employerRoutes);
app.use('/api/employees',  employeeRoutes);
app.use('/api/shifts',     shiftRoutes);
app.use('/api/attendance', attendanceRoutes);

// 4. Health-check & 404
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 5. Database connection & server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

