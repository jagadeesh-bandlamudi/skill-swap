const auth = require('./auth'); // Import your existing auth middleware

// This middleware runs *after* the auth middleware
module.exports = function(req, res, next) {
  // We can check req.user because the 'auth' middleware should have run first
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Not an administrator.' });
  }
  
  // If user is an admin, proceed
  next();
};