const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');


// import models for seeding
const User = require('./models/User');
const bcrypt = require('bcryptjs');


// 2. Route imports
const authRoutes        = require('./routes/authRoutes');
const shiftRoutes      = require('./routes/shiftRoutes');
const employeeRoutes   = require('./routes/employeeRoutes');
const employerRoutes   = require('./routes/employerRoutes');
const attendanceRoutes= require('./routes/attendanceRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// const attendanceRoutes = require('./routes/attendanceRoutes');

// 3. App setup
const app = express();

// Middleware
app.use(express.json());  // parse JSON bodies
app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  credentials: true
}));
app.use(cookieParser());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/shifts',     shiftRoutes);
app.use('/api/employees',  employeeRoutes);
app.use('/api/employers',  employerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

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
    const io = new Server(server, {
      cors: {
        origin: 'http://localhost:5173', 
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
    const broadcastAttendanceUpdate = (attendance) => {
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
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
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

module.exports = sendEmail;