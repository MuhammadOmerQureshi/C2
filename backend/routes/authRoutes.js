const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Import the middleware

router.post('/register', registerUser);
router.post('/login', loginUser);

// Example of a protected route
router.get('/profile', protect, (req, res) => {
    res.status(200).json({ message: `Welcome, user ${req.user.id}` });
});

module.exports = router;