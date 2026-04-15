const Log = require('../models/Log');
const Alert = require('../models/Alert');
const logger = require('./logger');

// Store memory states for rate limiting (in a real scenario, use Redis)
const failedLogins = new Map();
const apiRequests = new Map();

// Configuration Rules
const RULES = {
  BRUTE_FORCE_LIMIT: 5,        // Max failed logins
  BRUTE_FORCE_WINDOW: 60000,   // 60 seconds
  API_RATE_LIMIT: 50,          // Max API requests
  API_RATE_WINDOW: 60000,      // 60 seconds
};

class DetectionEngine {
  constructor(io) {
    this.io = io;
  }

  async processLog(logData) {
    const { event, ip, fileType } = logData;
    let alertData = null;

    // 1. Brute Force Detection
    if (event === 'login_failed') {
      alertData = await this.checkBruteForce(ip);
    }

    // 2. API Abuse Detection
    if (event === 'api_request') {
      alertData = await this.checkApiAbuse(ip);
    }

    // 3. Suspicious File Uploads
    if (event === 'file_upload') {
      alertData = await this.checkSuspiciousFile(ip, fileType);
    }

    // If an alert was generated, save and emit it
    if (alertData) {
      const alert = new Alert(alertData);
      await alert.save();
      logger.warn(`ALERT TRIGGERED: ${alertData.message} (IP: ${alertData.ip})`);
      if (this.io) {
        this.io.emit('new_alert', alert);
      }
    }
  }

  async checkBruteForce(ip) {
    const now = Date.now();
    if (!failedLogins.has(ip)) {
      failedLogins.set(ip, { count: 1, firstAttempt: now });
      return null;
    }

    const data = failedLogins.get(ip);
    
    // Reset window if passed
    if (now - data.firstAttempt > RULES.BRUTE_FORCE_WINDOW) {
      failedLogins.set(ip, { count: 1, firstAttempt: now });
      return null;
    }

    data.count += 1;
    failedLogins.set(ip, data);

    if (data.count === RULES.BRUTE_FORCE_LIMIT) {
      return {
        type: 'brute_force',
        message: 'Possible brute force attack detected.',
        ip: ip,
        count: data.count,
        severity: 'critical'
      };
    }
    return null;
  }

  async checkApiAbuse(ip) {
    const now = Date.now();
    if (!apiRequests.has(ip)) {
      apiRequests.set(ip, { count: 1, firstRequest: now });
      return null;
    }

    const data = apiRequests.get(ip);

    if (now - data.firstRequest > RULES.API_RATE_WINDOW) {
      apiRequests.set(ip, { count: 1, firstRequest: now });
      return null;
    }

    data.count += 1;
    apiRequests.set(ip, data);

    if (data.count === RULES.API_RATE_LIMIT) {
      return {
        type: 'api_abuse',
        message: 'API Abuse Detected: Rate limit exceeded.',
        ip: ip,
        count: data.count,
        severity: 'warning'
      };
    }
    return null;
  }

  async checkSuspiciousFile(ip, fileType) {
    const dangerousExtensions = ['.exe', '.sh', '.bin', '.bat', '.cmd'];
    if (dangerousExtensions.includes(fileType)) {
      return {
        type: 'suspicious_file',
        message: `Suspicious file uploaded: ${fileType}`,
        ip: ip,
        count: 1,
        severity: 'critical'
      };
    }
    return null;
  }
}

module.exports = DetectionEngine;
