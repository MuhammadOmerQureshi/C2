const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const path = require('path');
const i18next = require('./i18n');
const i18nextMiddleware = require('i18next-http-middleware');

// --- Declare io and broadcastAttendanceUpdate at the top ---
let io;
let broadcastAttendanceUpdate = () => {};

// import models for seeding
const User = require('./models/User');
const bcrypt = require('bcryptjs');
// 5. Database connection & server start
const PORT = process.env.PORT || 5000;

// 3. App setup
const app = express();
app.use(express.static(path.join(__dirname, '../frontend/dist/'))); // Serve static files from the public directory

// Middleware
app.use(express.json());  // parse JSON bodies
app.use(cors({
  origin: [
    'https://c2-85uf.onrender.com', 
    'http://localhost:5173'         
  ],
  credentials: true
}));
app.use(cookieParser());

// 2. Route imports
const authRoutes        = require('./routes/authRoutes');
const shiftRoutes      = require('./routes/shiftRoutes');
const employeeRoutes   = require('./routes/employeeRoutes');
const employerRoutes   = require('./routes/employerRoutes');
const attendanceRoutes= require('./routes/attendanceRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const contactRoutes = require('./routes/contactRoutes');
const employerSettingsRoutes = require('./routes/employerSettingsRoutes');

// Add i18next middleware
app.use(i18nextMiddleware.handle(i18next));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/shifts',     shiftRoutes);
app.use('/api/employees',  employeeRoutes);
app.use('/api/employers',  employerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/employer', employerSettingsRoutes);

// 404 handler for API routes only
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // --- Step 2: Seed hard-coded admin user if not exists ---
    const adminEmail = 'admin@company.com';
    const adminPassword = 'SuperSecret123';
    try {
      let admin = await User.findOne({ email: adminEmail });
      if (!admin) {
        const hashed = await bcrypt.hash(adminPassword, 10);
        admin = await User.create({
          firstName: 'Super',
          lastName:  'Admin',
          username:  'superadmin',
          email:     adminEmail,
          password:  hashed,
          address:   '',
          contactNo: '',
          role:      'admin'
        });
        console.log(`Seeded admin user: ${adminEmail}`);
      }
    } catch (err) {
      console.error('Error seeding admin user:', err);
    }

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    io = new Server(server, {
      cors: {
        origin: [
          'https://c2-85uf.onrender.com',
          'http://localhost:5173'
        ],
        credentials: true,
      },
    });

    // Handle WebSocket connections
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Broadcast attendance updates
    broadcastAttendanceUpdate = (attendance) => {
      io.emit('attendanceUpdate', attendance);
    };

    // start HTTP server after seeding
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // graceful shutdown
    function shutdown() {
      console.log('Shutting down server...');
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed.');
          process.exit(0);
        } catch (error) {
          console.error('Error closing MongoDB connection:', error);
          process.exit(1);
        }
      });
    }
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })
  .catch((error) => console.error('MongoDB connection error:', error));

const transporter = nodemailer.createTransport({
  service: 'brevo', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {
  sendEmail,
  broadcastAttendanceUpdate
};
