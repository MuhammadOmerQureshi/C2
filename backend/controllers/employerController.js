const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');
const employeeController = require('./employeeController');

// Employer dashboard endpoint
exports.getDashboard = async (req, res) => {
  try {
    res.json({ message: "Employer dashboard works!" });
  } catch (err) {
    console.error('Get dashboard error:', err);
    res.status(500).json({ message: 'Could not load dashboard' });
  }
};

// Create an employee (as employer)
exports.createEmployee = async (req, res) => {
  try {
    const employeeUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: "employee",
      employer: req.user.id
    });

    await EmployeeProfile.create({
      user: employeeUser._id,
      employeeId: req.body.employeeId,
      contact: req.body.contact,
      employer: req.user.id
    });

    res.status(201).json({ message: "Employee created successfully" });
  } catch (err) {
    console.error("Create employee error:", err);
    res.status(500).json({ message: "Could not add employee" });
  }
};

// List employees for this employer
exports.listEmployees = async (req, res) => {
  try {
    const profiles = await EmployeeProfile.find({ employer: req.user.id }).populate('user');
    const employees = profiles.map(profile => ({
      _id: profile.user._id,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      email: profile.user.email,
      username: profile.user.username,
      employeeId: profile.employeeId,
      contact: profile.contact,
    }));
    res.json(employees);
  } catch (err) {
    console.error('List employees error:', err);
    res.status(500).json({ message: 'Could not retrieve employees' });
  }
};

// Export all other generic employee functions if needed
module.exports = {
  ...employeeController,
  createEmployee: exports.createEmployee,
  listEmployees: exports.listEmployees,
  getDashboard: exports.getDashboard,
};



// 
// const User = require('../models/User');
// const EmployeeProfile = require('../models/EmployeeProfile');

// // POST /api/employer/addEmployee
// exports.addEmployee = async (req, res) => {
//   try {
//     // 1. Create the user
//     const employeeUser = await User.create({
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       email: req.body.email,
//       password: req.body.password,
//       role: "employee"
//     });

//     // 2. Create EmployeeProfile with employer set to current user (the employer)
//     await EmployeeProfile.create({
//       user: employeeUser._id,
//       employeeId: req.body.employeeId,
//       contact: req.body.contact,
//       employer: req.user.id
//     });

//     res.status(201).json({ message: "Employee created successfully" });
//   } catch (err) {
//     console.error("Add employee error:", err);
//     res.status(500).json({ message: "Could not add employee" });
//   }
// };

// // GET /api/employer/employees
// exports.listEmployees = async (req, res) => {
//   try {
//     // Only return employees for this employer
//     const profiles = await EmployeeProfile.find({ employer: req.user.id }).populate('user');
//     const employees = profiles.map(profile => ({
//       _id: profile.user._id,
//       firstName: profile.user.firstName,
//       lastName: profile.user.lastName,
//       email: profile.user.email,
//       employeeId: profile.employeeId,
//       contact: profile.contact,
//     }));
//     res.json(employees);
//   } catch (err) {
//     console.error('List employees error:', err);
//     res.status(500).json({ message: 'Could not retrieve employees' });
//   }
// };

// // GET /api/employer/dashboard (optional)
// exports.getDashboard = async (req, res) => {
//   try {
//     res.json({ message: "Employer dashboard works!" });
//   } catch (err) {
//     console.error('Get dashboard error:', err);
//     res.status(500).json({ message: 'Could not load dashboard' });
//   }
// };

// Add more employer-specific functions as needed (no frontend code here!)

// You can import and re-export employeeController functions, or add employer-specific logic here.
// const employeeController = require('./employeeController');

// module.exports = {
//   ...employeeController
// };





