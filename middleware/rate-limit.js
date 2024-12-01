const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  handler: (req, res, next) => {
    res.status(429).json({
      error: "Too many requests. Please try again after 1 minute.",
    });
  },
});

module.exports = rateLimiter;
