const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const sendEmail = require('../server'); // Import the sendEmail function

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  // Assumes req.user is set by your auth middleware
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
// Middleware to check if the user is an admin
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
router.get('/', requireAdmin, async (req, res) => {
  try {
    // Optionally, add authentication/authorization middleware here
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Get all messages (with search)
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};
    if (q) {
      filter = {
        $or: [
          { name:    { $regex: q, $options: 'i' } },
          { email:   { $regex: q, $options: 'i' } },
          { message: { $regex: q, $options: 'i' } }
        ]
      };
    }
    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Archive a message (add archived field)
router.patch('/:id/archive', requireAdmin, async (req, res) => {
  try {
    await ContactMessage.findByIdAndUpdate(req.params.id, { archived: true });
    res.json({ message: 'Archived' });
  } catch (err) {
    res.status(500).json({ message: 'Archive failed' });
  }
});

module.exports = router;