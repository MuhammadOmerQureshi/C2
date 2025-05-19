const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const EmployerSettings = require('../models/EmployerSettings');
const FailedAttemptLog = require('../models/FailedAttemptLog');
const { isValidIPv4 } = require('../utils/ipUtils');

const router = express.Router();

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get employer settings
router.get('/settings', protect, authorize('employer'), async (req, res) => {
  try {
    let settings = await EmployerSettings.findOne({ employer: req.user.id });
    
    if (!settings) {
      // Create default settings if none exist
      settings = await EmployerSettings.create({
        employer: req.user.id,
        approvedIPRanges: [],
        enforceIPVerification: true
      });
    }
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching employer settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update employer settings
router.put('/settings', protect, authorize('employer'), async (req, res) => {
  try {
    const { enforceIPVerification } = req.body;
    
    let settings = await EmployerSettings.findOne({ employer: req.user.id });
    
    if (!settings) {
      settings = await EmployerSettings.create({
        employer: req.user.id,
        approvedIPRanges: [],
        enforceIPVerification: enforceIPVerification !== undefined ? enforceIPVerification : true
      });
    } else {
      if (enforceIPVerification !== undefined) {
        settings.enforceIPVerification = enforceIPVerification;
        await settings.save();
      }
    }
    
    res.status(200).json({ message: 'Settings updated', settings });
  } catch (error) {
    console.error('Error updating employer settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add IP range
router.post('/ip-ranges', 
  protect, 
  authorize('employer'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('startIP').custom(value => {
      if (!isValidIPv4(value)) {
        throw new Error('Invalid start IP format');
      }
      return true;
    }),
    body('endIP').custom(value => {
      if (!isValidIPv4(value)) {
        throw new Error('Invalid end IP format');
      }
      return true;
    })
  ],
  validate,
  async (req, res) => {
    try {
      const { name, startIP, endIP } = req.body;
      
      let settings = await EmployerSettings.findOne({ employer: req.user.id });
      
      if (!settings) {
        settings = await EmployerSettings.create({
          employer: req.user.id,
          approvedIPRanges: [{
            name,
            startIP,
            endIP,
            active: true
          }],
          enforceIPVerification: true
        });
      } else {
        settings.approvedIPRanges.push({
          name,
          startIP,
          endIP,
          active: true
        });
        await settings.save();
      }
      
      res.status(201).json({ 
        message: 'IP range added', 
        ipRange: settings.approvedIPRanges[settings.approvedIPRanges.length - 1] 
      });
    } catch (error) {
      console.error('Error adding IP range:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update IP range
router.put('/ip-ranges/:id', 
  protect, 
  authorize('employer'),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('startIP').optional().custom(value => {
      if (!isValidIPv4(value)) {
        throw new Error('Invalid start IP format');
      }
      return true;
    }),
    body('endIP').optional().custom(value => {
      if (!isValidIPv4(value)) {
        throw new Error('Invalid end IP format');
      }
      return true;
    }),
    body('active').optional().isBoolean().withMessage('Active must be a boolean')
  ],
  validate,
  async (req, res) => {
    try {
      const { name, startIP, endIP, active } = req.body;
      const rangeId = req.params.id;
      
      const settings = await EmployerSettings.findOne({ employer: req.user.id });
      
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }
      
      const ipRange = settings.approvedIPRanges.id(rangeId);
      
      if (!ipRange) {
        return res.status(404).json({ message: 'IP range not found' });
      }
      
      if (name) ipRange.name = name;
      if (startIP) ipRange.startIP = startIP;
      if (endIP) ipRange.endIP = endIP;
      if (active !== undefined) ipRange.active = active;
      
      await settings.save();
      
      res.status(200).json({ message: 'IP range updated', ipRange });
    } catch (error) {
      console.error('Error updating IP range:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete IP range
router.delete('/ip-ranges/:id', protect, authorize('employer'), async (req, res) => {
  try {
    const rangeId = req.params.id;
    
    const settings = await EmployerSettings.findOne({ employer: req.user.id });
    
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    const ipRange = settings.approvedIPRanges.id(rangeId);
    
    if (!ipRange) {
      return res.status(404).json({ message: 'IP range not found' });
    }
    
    ipRange.remove();
    await settings.save();
    
    res.status(200).json({ message: 'IP range deleted' });
  } catch (error) {
    console.error('Error deleting IP range:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// View failed attempts
router.get('/failed-attempts', protect, authorize('employer'), async (req, res) => {
  try {
    const failedAttempts = await FailedAttemptLog.find({ employer: req.user.id })
      .populate('employee', 'firstName lastName username')
      .sort({ attemptTime: -1 });
    
    res.status(200).json(failedAttempts);
  } catch (error) {
    console.error('Error fetching failed attempts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
