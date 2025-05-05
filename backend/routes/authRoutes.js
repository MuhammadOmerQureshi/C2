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
    bulkDeleteUsers,
    getAuditLogs,
            
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { clockIn, clockOut, getAttendance, exportAttendance, getAttendanceDashboard } = require('../controllers/attendanceController');

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
router.get('/audit-logs', protect, authorize('admin'), getAuditLogs); // Fetch audit logs
router.get('/attendance', protect, authorize('admin', 'employer'), getAttendance); // Fetch attendance records
router.get('/attendance/export', protect, authorize('admin'), exportAttendance); // Export attendance as CSV
router.get('/attendance/dashboard', protect, authorize('admin', 'employer'), getAttendanceDashboard); // Dashboard API

// Clock-In/Clock-Out routes
router.post('/clock-in', protect, clockIn); // Clock-in route
router.post('/clock-out', protect, clockOut); // Clock-out route

module.exports = router;

