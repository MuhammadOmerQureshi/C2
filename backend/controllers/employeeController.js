/*const bcrypt = require('bcryptjs');
const User = require('../models/User');

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

    // Omit password from response
    const { password: _p, ...data } = employee.toObject();
    res.status(201).json({ message: 'Employee created', employee: data });
  } catch (err) {
    console.error('createEmployee error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List all employees under this employer (for now: all employees)
exports.listEmployees = async (req, res) => {
  try {
    // Optionally, filter by employer if you have such a field
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get one employee’s profile by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' }).select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an employee’s profile
exports.updateEmployee = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    // Prevent role change via this endpoint
    delete updates.role;

    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'employee' },
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee updated', employee });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an employee profile
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findOneAndDelete({ _id: req.params.id, role: 'employee' });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
*/