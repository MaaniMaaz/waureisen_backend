// middlewares/role.js
const Provider = require('../models/provider.model'); // Adjust path as needed
const User = require('../models/user.model'); // Import User model

exports.isAdmin = async (req, res, next) => {
  try {
    // Check if user exists and has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Not an admin' });
    }
    next();
  } catch (err) {
    next(err);
  }
};

exports.isProvider = async (req, res, next) => {
  try {
    // Check if user role is provider from JWT token
    if (!req.user || req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied: Not a provider' });
    }
    
    // Optional: Validate the ID exists in the Provider collection
    if (req.user.id) {
      const provider = await Provider.findById(req.user.id);
      if (!provider) {
        return res.status(403).json({ message: 'Provider not found in database' });
      }
    }
    
    next();
  } catch (err) {
    console.error('Error in isProvider middleware:', err);
    return res.status(500).json({ message: 'Server error while checking provider status' });
  }
};

exports.isUser = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied: Not a user' });
    }
    next();
  } catch (err) {
    next(err);
  }
};