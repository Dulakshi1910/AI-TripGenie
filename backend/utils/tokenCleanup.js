const BlacklistedToken = require('../models/BlacklistedToken');

/**
 * Removes expired tokens from the blacklist
 * This is a backup in case the TTL index doesn't work properly
 */
const cleanupExpiredTokens = async () => {
  try {
    const now = new Date();
    const result = await BlacklistedToken.deleteMany({
      expiresAt: { $lt: now }
    });
    
    console.log(`Token cleanup: ${result.deletedCount} expired tokens removed`);
  } catch (error) {
    console.error('Token cleanup error:', error.message);
  }
};

/**
 * Schedule token cleanup to run periodically
 * @param {number} interval - Interval in milliseconds (default: 1 day)
 */
const scheduleTokenCleanup = (interval = 24 * 60 * 60 * 1000) => {
  // Run cleanup once when server starts
  cleanupExpiredTokens();
  
  // Schedule periodic cleanups
  setInterval(cleanupExpiredTokens, interval);
};

module.exports = { scheduleTokenCleanup };
