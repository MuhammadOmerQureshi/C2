const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { 
    loginUser,
    registerEmployer,   // new controller for admin to register employers
    // registerUser,     // remove or disable public registration
    getMe, 
    updateUserStatus, 
    getAllUsers,
    updateUserProfile, 
    deleteUser,        
    getUserById,
    bulkUpdateUserStatus,
    bulkDeleteUsers        
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Public routes
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    loginUser
);

// Admin-only: create employer
router.post(
    '/employers',
    protect,
    authorize('admin'),
    [
        body('firstName').notEmpty().withMessage('First name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
        body('username').notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    validate,
    registerEmployer
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateUserProfile);

// Admin-only management routes
router.put('/status', protect, authorize('admin'), updateUserStatus);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.put('/bulk-status', protect, authorize('admin'), bulkUpdateUserStatus);
router.delete('/bulk-delete', protect, authorize('admin'), bulkDeleteUsers);

module.exports = router;
