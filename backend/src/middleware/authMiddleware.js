const jwt = require('jsonwebtoken');
const { User } = require('../models/postgresql');

/**
 * Authentication Middleware
 * Verifies JWT token and adds user to request object
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') ||
                  req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: ['No token, authorization denied']
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: ['JWT_SECRET not configured']
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'role', 'is_active']
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: ['Token is not valid']
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: ['Token is not valid']
    });
  }
};

module.exports = authMiddleware;
