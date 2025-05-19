const EmployeeProfile = require('../models/EmployeeProfile');
const EmployerSettings = require('../models/EmployerSettings');
const FailedAttemptLog = require('../models/FailedAttemptLog');
const { isIPInRange } = require('../utils/ipUtils');

/**
 * Middleware to verify employee IP during clock-in
 */
const verifyEmployeeIP = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Get employee profile to find employer
    const employeeProfile = await EmployeeProfile.findOne({ user: employeeId });
    if (!employeeProfile) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    
    const employerId = employeeProfile.employer;
    
    // Get employer settings with IP ranges
    const employerSettings = await EmployerSettings.findOne({ employer: employerId });
    if (!employerSettings || !employerSettings.enforceIPVerification) {
      // If no settings or verification disabled, allow clock-in
      return next();
    }
    
    // Check if IP is in any of the approved ranges
    const isApproved = employerSettings.approvedIPRanges.some(range => 
      range.active && isIPInRange(ipAddress, range.startIP, range.endIP)
    );
    
    if (isApproved) {
      return next();
    }
    
    // Log failed attempt
    await FailedAttemptLog.create({
      employee: employeeId,
      employer: employerId,
      ipAddress,
      reason: 'IP not in approved ranges'
    });
    
    return res.status(403).json({ 
      message: 'Clock-in denied: Your IP address is not approved. Please contact your company administrator.' 
    });
  } catch (error) {
    console.error('IP verification error:', error);
    return res.status(500).json({ message: 'Server error during IP verification' });
  }
};

module.exports = { verifyEmployeeIP };
