const nodemailer = require('nodemailer');

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'brevo', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Function to send an email
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Sender's email address
      to, // Recipient's email address
      subject, // Email subject
      text, // Email body
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;