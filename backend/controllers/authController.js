const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const AuditLog = require('../models/AuditLog');

// Register a new user
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login a user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the user is active
        if (user.status !== 'active') {
            return res.status(403).json({ message: 'Your account is not active. Please contact support.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Update lastLogin field
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get the authenticated user's details
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users (Admin only) with pagination, sorting, and filtering
exports.getAllUsers = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'name', order = 'asc', role, status, search, lastLoginFrom, lastLoginTo } = req.query;
    try {
        const sortOrder = order === 'desc' ? -1 : 1;
        const filter = {};

        // Add filters if provided
        if (role) filter.role = role;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } }, // Case-insensitive search on name
                { email: { $regex: search, $options: 'i' } } // Case-insensitive search on email
            ];
        }
        if (lastLoginFrom || lastLoginTo) {
            filter.lastLogin = {};
            if (lastLoginFrom) filter.lastLogin.$gte = new Date(lastLoginFrom);
            if (lastLoginTo) filter.lastLogin.$lte = new Date(lastLoginTo);
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments(filter);
        res.status(200).json({
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: parseInt(page),
            users,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single user by ID (Admin only)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Exclude password
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a user's status (Admin only)
exports.updateUserStatus = [
    // Validation rules
    body('status')
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('Status must be one of: active, inactive, suspended'),
        // Controller logic
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Extract userId and status from request body
        const { userId, status } = req.body;
        try {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            user.status = status;
            await user.save();

            // Log the action
            await AuditLog.create({
                action: 'updateStatus',
                performedBy: req.user.id,
                targetUser: userId,
                details: { status },
            });

            res.status(200).json({ message: `User status updated to ${status}` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];

// Update authenticated user's profile
exports.updateUserProfile = [
    // Validation rules
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty'),

    // Controller logic
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phoneNumber, address } = req.body;
        try {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Update fields
            if (name) user.name = name;
            if (email) user.email = email;
            if (phoneNumber) user.phoneNumber = phoneNumber;
            if (address) user.address = address;

            await user.save();
            res.status(200).json({ message: 'Profile updated successfully', user });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];

// Update the status of multiple users (Admin only)
exports.bulkUpdateUserStatus = [
    // Validation rules
    body('userIds').isArray({ min: 1 }).withMessage('User IDs must be an array with at least one ID'),
    body('status')
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('Status must be one of: active, inactive, suspended'),

    // Controller logic
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userIds, status } = req.body;
        try {
            const result = await User.updateMany(
                { _id: { $in: userIds } }, // Match users by IDs
                { $set: { status } } // Update status
            );

            res.status(200).json({
                message: `Status updated to '${status}' for ${result.nModified} users`,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];

// Delete a user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Delete multiple users (Admin only)
exports.bulkDeleteUsers = [
    body('userIds').isArray({ min: 1 }).withMessage('User IDs must be an array with at least one ID'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userIds } = req.body;
        try {
            const result = await User.deleteMany({ _id: { $in: userIds } });

            // Log the action
            await AuditLog.create({
                action: 'bulkDelete',
                performedBy: req.user.id,
                details: { userIds },
            });

            res.status(200).json({ message: `${result.deletedCount} users deleted successfully` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];
// Fetch audit logs (Admin only)
exports.getAuditLogs = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'timestamp', order = 'desc', action, performedBy, targetUser } = req.query;
    try {
        const sortOrder = order === 'desc' ? -1 : 1;
        const filter = {};

        // Add filters if provided
        if (action) filter.action = action;
        if (performedBy) filter.performedBy = performedBy;
        if (targetUser) filter.targetUser = targetUser;

        const logs = await AuditLog.find(filter)
            .populate('performedBy', 'name email') // Populate admin details
            .populate('targetUser', 'name email') // Populate target user details
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalLogs = await AuditLog.countDocuments(filter);
        res.status(200).json({
            totalLogs,
            totalPages: Math.ceil(totalLogs / limit),
            currentPage: parseInt(page),
            logs,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
