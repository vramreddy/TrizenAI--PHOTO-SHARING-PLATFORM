const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    next(error);
  }
};

/**
 * Restrict access to admin users only
 */
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

/**
 * Restrict access to team members only
 */
const authorizeTeamMember = (req, res, next) => {
  if (req.user.role !== 'team_member') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Team member privileges required.',
    });
  }
  next();
};

/**
 * Verify gallery access token (separate from user JWT)
 */
const verifyGalleryToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Gallery ')) {
      return res.status(401).json({
        success: false,
        message: 'Gallery access denied. PIN verification required.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.GALLERY_TOKEN_SECRET);

    if (decoded.slug !== req.params.slug) {
      return res.status(403).json({
        success: false,
        message: 'Gallery token does not match this gallery.',
      });
    }

    req.galleryAccess = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Gallery access expired or invalid. Please enter PIN again.',
    });
  }
};

module.exports = { authenticate, authorizeAdmin, authorizeTeamMember, verifyGalleryToken };
