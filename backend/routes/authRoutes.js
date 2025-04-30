const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getMe, 
    updateUserStatus, 
    getAllUsers 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware

// Public routes
router.post('/register', registerUser); // Register a new user
router.post('/login', loginUser);       // Login a user

// Protected routes
router.get('/me', protect, getMe); // Get authenticated user's details

// Admin-only routes
router.put('/status', protect, authorize('admin'), updateUserStatus); // Update user status
router.get('/users', protect, authorize('admin'), getAllUsers);       // Get all users

module.exports = router;