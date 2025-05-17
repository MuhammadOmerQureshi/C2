const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const sendEmail = require('../server'); // Import the sendEmail function

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  // Validation
  if (!name || /\d/.test(name)) return res.status(400).json({ message: 'Invalid name' });
  if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return res.status(400).json({ message: 'Invalid email' });
  if (!message) return res.status(400).json({ message: 'Message required' });

  try {
    // Save to DB
    await ContactMessage.create({ name, email, message });

    // Send email to admin (change to your admin email)
    await sendEmail(
      process.env.CONTACT_RECEIVER || 'admin@company.com',
      'New Contact Message',
      `From: ${name} <${email}>\n\n${message}`
    );

    return res.json({ message: 'Contact message received!' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});
// Get all contact messages (admin only)
router.get('/', async (req, res) => {
  try {
    // Optionally, add authentication/authorization middleware here
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;