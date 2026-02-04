const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const accessControl = require('../utils/accessControl.util');

// Verify JWT Token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Access denied.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message
    });
  }
};

// Check role-based access
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      accessControl.logAccess(req.user.role, req.path, req.method, false);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    accessControl.logAccess(req.user.role, req.path, req.method, true);
    next();
  };
};

// Access Control Middleware using ACL
const checkAccess = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.user.role;
    const route = req.path;
    const method = req.method;

    // Check ACL
    const hasAccess = accessControl.checkRouteAccess(route, method, userRole);

    if (!hasAccess) {
      accessControl.logAccess(userRole, route, method, false);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.'
      });
    }

    accessControl.logAccess(userRole, route, method, true);
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking access permissions.',
      error: error.message
    });
  }
};

// Check object-level permission
const checkObjectPermission = (object, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    let hasPermission = accessControl.checkPermission(
      req.user.role,
      object,
      action
    );

    // Special case: allow 'read_own' for users if checking 'read' on bookings
    if (!hasPermission && req.user.role === 'user' && object === 'bookings' && action === 'read') {
      hasPermission = accessControl.checkPermission(req.user.role, object, 'read_own');
    }

    if (!hasPermission) {
      accessControl.logAccess(req.user.role, object, action, false);
      return res.status(403).json({
        success: false,
        message: `Access denied. You do not have ${action} permission on ${object}.`
      });
    }

    accessControl.logAccess(req.user.role, object, action, true);
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
  checkAccess,
  checkObjectPermission
};