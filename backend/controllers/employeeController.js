const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');

// Create a new employee (employer only)
exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      address,
      contactNo,
      employeeId
    } = req.body;

    // Check for required fields
    if (!firstName || !lastName || !username || !email || !password || !employeeId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for duplicate email, username, or employeeId
    const exists = await User.findOne({
      $or: [
        { email },
        { username },
        { employeeId }
      ]
    });
    if (exists) {
      return res.status(409).json({ message: 'Email, username, or employee ID already in use' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create employee user
    const employee = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashed,
      address,
      contactNo,
      employeeId,
      role: 'employee'
    });

    // Create employee profile with link to employer
    await EmployeeProfile.create({
      user: employee._id,
      employeeId,
      contact: contactNo,
      employer: req.user.id // Link to the currently authenticated employer
    });

    // Omit password from response
    const { password: _p, ...data } = employee.toObject();
    res.status(201).json({ message: 'Employee created', employee: data });
  } catch (err) {
    console.error('createEmployee error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List all employees under this employer
exports.listEmployees = async (req, res) => {
  try {
    // Find all employee profiles where employer matches the current user
    const employeeProfiles = await EmployeeProfile.find({ employer: req.user.id }).populate('user');
    
    // Extract user data from profiles and remove password
    const employees = employeeProfiles.map(profile => {
      const userData = profile.user.toObject();
      delete userData.password;
      return userData;
    });
    
    res.status(200).json(employees);
  } catch (err) {
    console.error('listEmployees error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get one employee's profile by ID
exports.getEmployeeById = async (req, res) => {
  try {
    // Check if employee belongs to this employer
    const employeeProfile = await EmployeeProfile.findOne({
      user: req.params.id,
      employer: req.user.id
    }).populate('user');

    if (!employeeProfile) {
      return res.status(404).json({ message: 'Employee not found or not authorized to access' });
    }

    // Return employee data without password
    const userData = employeeProfile.user.toObject();
    delete userData.password;
    
    res.status(200).json(userData);
  } catch (err) {
    console.error('getEmployeeById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an employee's profile
exports.updateEmployee = async (req, res) => {
  try {
    // Check if employee belongs to this employer
    const employeeProfile = await EmployeeProfile.findOne({
      user: req.params.id,
      employer: req.user.id
    });

    if (!employeeProfile) {
      return res.status(404).json({ message: 'Employee not found or not authorized to update' });
    }

    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    // Prevent role change via this endpoint
    delete updates.role;

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee updated', employee });
  } catch (err) {
    console.error('updateEmployee error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an employee profile
exports.deleteEmployee = async (req, res) => {
  try {
    // Check if employee belongs to this employer
    const employeeProfile = await EmployeeProfile.findOne({
      user: req.params.id,
      employer: req.user.id
    });

    if (!employeeProfile) {
      return res.status(404).json({ message: 'Employee not found or not authorized to delete' });
    }

    // Delete the employee profile first
    await EmployeeProfile.findByIdAndDelete(employeeProfile._id);
    
    // Then delete the user
    const employee = await User.findByIdAndDelete(req.params.id);
    
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee deleted' });
  } catch (err) {
    console.error('deleteEmployee error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};