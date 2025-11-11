const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle both payload formats: { id } and { user: { id } }
    const userId = decoded.id || decoded.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token format.'
      });
    }
    
    // Get user from database
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. User not found.'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User account is inactive.'
      });
    }
    
    req.user = user;
    req.user.id = user._id.toString();
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired. Please login again.'
      });
    }
    console.error('Auth middleware error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed.'
    });
  }
};

module.exports = auth;
