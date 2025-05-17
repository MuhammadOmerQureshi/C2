const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');

// Create a new employee (called by both employer and employee routes)
exports.createEmployee = async (req, res) => {
  try {
    console.log('Employee creation request body:', req.body); // Log the request body

    const { firstName, lastName, username, email, password, employeeId, contact, employerId } = req.body;

    // Add validation
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    // Check for duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Employee already exists with this email' });
    }

    // Find employer by employerId
    const employer = await User.findOne({ employerId, role: 'employer' });
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found with provided Employer ID' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee user
    const employeeUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role: "employee"
    });

    // Create employee profile linked to employer
    await EmployeeProfile.create({
      user: employeeUser._id,
      employeeId,
      contact,
      employer: employer._id // Link to employer's MongoDB _id
    });

    res.status(201).json({ message: "Employee created successfully" });
  } catch (err) {
    console.warn("Add employee error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// List all employees for an employer
exports.listEmployees = async (req, res) => {
  try {
    const profiles = await EmployeeProfile.find({ employer: req.user.id }).populate('user');
    const employees = profiles.map(profile => ({
      ...profile.user.toObject(),
      employeeId: profile.employeeId,
      contact: profile.contact,
    }));
    res.json(employees);
  } catch (err) {
    console.error('List employees error:', err);
    res.status(500).json({ message: 'Could not retrieve employees' });
  }
};

// Get one employee's profile by ID (keep your existing implementation if needed)
exports.getEmployeeById = async (req, res) => {
  try {
    const employeeProfile = await EmployeeProfile.findOne({
      user: req.params.id,
      employer: req.user.id
    }).populate('user');

    if (!employeeProfile) {
      return res.status(404).json({ message: 'Employee not found or not authorized to access' });
    }

    const userData = employeeProfile.user.toObject();
    delete userData.password;

    res.status(200).json({
      ...userData,
      employeeId: employeeProfile.employeeId,
      contact: employeeProfile.contact
    });
  } catch (err) {
    console.error('getEmployeeById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await EmployeeProfile.findOne({ user: id, employer: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Employee not found or not yours' });

    // Update user data
    await User.findByIdAndUpdate(id, req.body);
    // Optionally update profile data too
    if (req.body.employeeId || req.body.contact) {
      await EmployeeProfile.findByIdAndUpdate(profile._id, {
        employeeId: req.body.employeeId || profile.employeeId,
        contact: req.body.contact || profile.contact
      });
    }

    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    console.error('Update employee error:', err);
    res.status(500).json({ message: 'Could not update employee' });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await EmployeeProfile.findOne({ user: id, employer: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Employee not found or not yours' });

    await User.findByIdAndDelete(id);
    await EmployeeProfile.findByIdAndDelete(profile._id);

    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ message: 'Could not delete employee' });
  }
};
