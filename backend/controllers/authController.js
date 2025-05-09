const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const AuditLog = require('../models/AuditLog');

// Admin-only: create a new Employer account
exports.registerEmployer = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            address,
            contactNo
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Prevent duplicates by email or username
        const exists = await User.findOne({ $or: [{ email }, { username }] });
        if (exists) {
            return res.status(409).json({ message: 'Email or username already in use' });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Create employer user
        const employer = await User.create({
            firstName,
            lastName,
            username,
            email,
            password: hashed,
            address,
            contactNo,
            role: 'employer'
        });

        // Omit password from response
        const { password: _p, ...data } = employer.toObject();
        res.status(201).json({ message: 'Employer created', employer: data });
    } catch (err) {
        console.error('registerEmployer error:', err);
        res.status(500).json({ message: 'Server error in Create Employer' });
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
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// RegisterUser is now internal; public registration disabled
// exports.registerUser = async (req, res) => { /* removed */ };

// Get all users (Admin only) with pagination, sorting, and filtering
exports.getAllUsers = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'name', order = 'asc', role, status, search, lastLoginFrom, lastLoginTo } = req.query;
    try {
        const sortOrder = order === 'desc' ? -1 : 1;
        const filter = {};

        if (role) filter.role = role;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
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
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a user's status (Admin only)
exports.updateUserStatus = [
    body('status')
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('Status must be one of: active, inactive, suspended'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, status } = req.body;
        try {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            user.status = status;
            await user.save();

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
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phoneNumber, address } = req.body;
        try {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

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







// Bulk update user status (Admin only)
exports.bulkUpdateUserStatus = [
    body('userIds').isArray({ min: 1 }).withMessage('userIds must be a non-empty array'),
    body('status')
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('Status must be one of: active, inactive, suspended'),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { userIds, status } = req.body;
      try {
        const result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { status } }
        );
  
        // Log each status change
        for (const userId of userIds) {
          await AuditLog.create({
            action: 'bulkUpdateStatus',
            performedBy: req.user.id,
            targetUser: userId,
            details: { status },
          });
        }
  
        res.status(200).json({
          message: `Status updated to '${status}' for ${result.nModified || result.modifiedCount} users.`,
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  ];
  



  exports.deleteUser = async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Prevent self-deletion
      if (req.user.id === userId) {
        return res.status(400).json({ message: "You cannot delete your own account." });
      }
  
      const user = await User.findByIdAndDelete(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Log the deletion
      await AuditLog.create({
        action: 'deleteUser',
        performedBy: req.user.id,
        targetUser: userId,
        details: {},
      });
  
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  // Bulk delete users (Admin only)
  exports.bulkDeleteUsers = [
    body('userIds').isArray({ min: 1 }).withMessage('userIds must be a non-empty array'),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { userIds } = req.body;
      try {
        const result = await User.deleteMany({ _id: { $in: userIds } });
  
        // Log each deletion
        for (const userId of userIds) {
          await AuditLog.create({
            action: 'bulkDelete',
            performedBy: req.user.id,
            targetUser: userId,
            details: {},
          });
        }
  
        res.status(200).json({
          message: `Deleted ${result.deletedCount} users.`,
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  ];

  