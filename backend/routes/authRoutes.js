const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getMe, 
    updateUserStatus, 
    getAllUsers,
    updateUserProfile, 
    deleteUser,        
    getUserById        
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware

// Public routes
router.post('/register', registerUser); // Register a new user
router.post('/login', loginUser);       // Login a user

// Protected routes
router.get('/me', protect, getMe); // Get authenticated user's details
router.put('/me', protect, updateUserProfile); // Update authenticated user's profile

// Admin-only routes
router.put('/status', protect, authorize('admin'), updateUserStatus); // Update user status
router.get('/users', protect, authorize('admin'), getAllUsers);       // Get all users
router.get('/users/:id', protect, authorize('admin'), getUserById);   // Get a single user by ID
router.delete('/users/:id', protect, authorize('admin'), deleteUser); // Delete a user by ID

module.exports = router;