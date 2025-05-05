const express = require('express');
const { body, validationResult } = require('express-validator'); // Import express-validator
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
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

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Public routes
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    validate,
    registerUser
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    loginUser
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateUserProfile);

// Admin-only routes
router.put('/status', protect, authorize('admin'), updateUserStatus);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.put('/bulk-status', protect, authorize('admin'), bulkUpdateUserStatus); // Bulk status update
router.delete('/bulk-delete', protect, authorize('admin'), bulkDeleteUsers);   // Bulk delete users

module.exports = router;

//comments