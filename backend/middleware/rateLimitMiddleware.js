const rateLimit = require('express-rate-limit');

// Rate limiting for message sending
const messageRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each user to 30 messages per windowMs
  message: {
    error: 'Too many messages sent, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID as the key for rate limiting
    return req.user ? req.user._id.toString() : req.ip;
  },
  skip: (req) => {
    // Skip rate limiting for admin users if needed
    return req.user && req.user.role === 'admin';
  }
});

// Rate limiting for conversation creation
const conversationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each user to 10 new conversations per windowMs
  message: {
    error: 'Too many conversations created, please try again later.',
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Rate limiting for search requests
const searchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each user to 20 searches per minute
  message: {
    error: 'Too many search requests, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Socket.IO rate limiting for real-time events
class SocketRateLimiter {
  constructor() {
    this.userLimits = new Map(); // userId -> { count, resetTime }
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  checkLimit(userId, eventType, limit = 60, windowMs = 60000) {
    const now = Date.now();
    const key = `${userId}_${eventType}`;
    
    if (!this.userLimits.has(key)) {
      this.userLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    const userLimit = this.userLimits.get(key);
    
    if (now > userLimit.resetTime) {
      // Reset the limit
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
      return true;
    }

    if (userLimit.count >= limit) {
      return false; // Rate limit exceeded
    }

    userLimit.count++;
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, limit] of this.userLimits.entries()) {
      if (now > limit.resetTime) {
        this.userLimits.delete(key);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.userLimits.clear();
  }
}

const socketRateLimiter = new SocketRateLimiter();

module.exports = {
  messageRateLimit,
  conversationRateLimit,
  searchRateLimit,
  socketRateLimiter
};