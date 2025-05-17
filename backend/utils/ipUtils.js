/**
 * IP Validation Utilities
 * Provides functions for validating and comparing IP addresses
 */

// Convert IPv4 to numeric value for comparison
const ipv4ToLong = (ip) => {
  const parts = ip.split('.');
  return ((parseInt(parts[0], 10) << 24) |
          (parseInt(parts[1], 10) << 16) |
          (parseInt(parts[2], 10) << 8) |
          parseInt(parts[3], 10)) >>> 0;
};

// Check if an IPv4 address is valid
const isValidIPv4 = (ip) => {
  const pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (!pattern.test(ip)) return false;
  
  const parts = ip.split('.');
  for (let i = 0; i < 4; i++) {
    const part = parseInt(parts[i], 10);
    if (part < 0 || part > 255) return false;
  }
  return true;
};

// Check if an IP is within a given range
const isIPInRange = (ip, startIP, endIP) => {
  // Currently only supporting IPv4
  if (!isValidIPv4(ip) || !isValidIPv4(startIP) || !isValidIPv4(endIP)) {
    return false;
  }
  
  const ipLong = ipv4ToLong(ip);
  const startLong = ipv4ToLong(startIP);
  const endLong = ipv4ToLong(endIP);
  
  return ipLong >= startLong && ipLong <= endLong;
};

module.exports = {
  ipv4ToLong,
  isValidIPv4,
  isIPInRange
};