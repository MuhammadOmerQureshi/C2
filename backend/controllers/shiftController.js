const Shift = require('../models/Shift');
const User = require('../models/User');

// POST /api/shifts (employer)
exports.createShift = async (req, res) => {
  try {
    const { employeeId, date, startTime, endTime } = req.body;

    // Check if employee exists
    const employee = await User.findOne({ employeeId, role: 'employee' });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const shift = await Shift.create({
      employeeId: employee._id,
      date,
      startTime,
      endTime,
      status: 'scheduled',
      createdBy: req.user.id // employer's id
    });

    res.status(201).json({ message: 'Shift created', shift });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/shifts (employer)
exports.listShiftsForEmployer = async (req, res) => {
  try {
    // Optionally, filter by employer if you have such a field
    const shifts = await Shift.find({ createdBy: req.user.id }).populate('employeeId', '-password');
    res.status(200).json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/shifts/my/shifts (employee)
exports.listMyShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ employeeId: req.user.id }).sort({ date: 1 });
    res.status(200).json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/shifts/:id (employer)
exports.updateShift = async (req, res) => {
  try {
    const updates = { ...req.body };
    const shift = await Shift.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!shift) return res.status(404).json({ message: 'Shift not found' });
    res.status(200).json({ message: 'Shift updated', shift });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/shifts/:id (employer)
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!shift) return res.status(404).json({ message: 'Shift not found' });
    res.status(200).json({ message: 'Shift deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
