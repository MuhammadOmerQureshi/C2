const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import the middleware

router.post('/register', registerUser); // Public route
router.post('/login', loginUser);       // Public route

// Protected route for all authenticated users
router.get('/profile', protect, (req, res) => {
    res.status(200).json({ message: `Welcome, user ${req.user.id}` });
});

// Admin-only route
router.get('/admin', protect, authorize('admin'), (req, res) => {
    res.status(200).json({ message: 'Welcome, Admin!' });
});

// Employee-only route
router.get('/employee', protect, authorize('employee'), (req, res) => {
    res.status(200).json({ message: 'Welcome, Employee!' });
});

module.exports = router;