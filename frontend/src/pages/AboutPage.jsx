import React from 'react';

const AboutPage = () => (
  <div style={{ maxWidth: 800, margin: '2rem auto', padding: 20 }}>
    <h2>About C2 Workforce Management System</h2>
    <p>
      <strong>C2</strong> is a full-stack workforce management platform designed to streamline employee and employer interactions, attendance tracking, shift management, and secure authentication.
    </p>
    <h3>Key Features</h3>
    <ul>
      <li>Modern authentication with JWT and secure cookies</li>
      <li>Role-based dashboards for Admin, Employer, and Employee</li>
      <li>Attendance tracking and shift scheduling</li>
      <li>Password reset with email verification</li>
      <li>Contact Us form with validation, database storage, and admin notifications</li>
      <li>Admin panel for managing users and viewing contact messages</li>
      <li>Chatbot integration for quick support</li>
      <li>Responsive design with a digital clock and footer</li>
      <li>Export attendance data (PDF/Excel)</li>
      <li>Search, filter, archive, and delete contact messages (admin only)</li>
    </ul>
    <h3>Technologies Used</h3>
    <ul>
      <li>Frontend: React, Axios, React Router</li>
      <li>Backend: Node.js, Express, MongoDB, Mongoose</li>
      <li>Authentication: JWT, bcrypt, secure cookies</li>
      <li>Email: Nodemailer</li>
      <li>Deployment: Render</li>
    </ul>
    <p>
      This project demonstrates a robust, secure, and user-friendly workforce management solution suitable for modern organizations.
    </p>
  </div>
);

export default AboutPage;