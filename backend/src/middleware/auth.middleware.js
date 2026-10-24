const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const redisClient = require('../config/redis');
const { AppError, asyncHandler } = require('../utils/errorUtils');

// Protect routes - verify JWT
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) return next(new AppError('Not authenticated. Please log in.', 401));

  // Check if token is blacklisted
  // Skip the blacklist check when Redis is not running (e.g. local setup without Redis)
  const isBlacklisted = redisClient?.isReady ? await redisClient.get(`blacklist:${token}`) : null;
  if (isBlacklisted) return next(new AppError('Token has been invalidated. Please log in again.', 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token.', 401));
  }

  const user = await User.findById(decoded.id).select('+isActive');
  if (!user) return next(new AppError('User no longer exists.', 401));
  if (!user.isActive) return next(new AppError('Account has been deactivated.', 403));

  req.user = user;
  next();
});

// Authorize roles
exports.authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Role '${req.user.role}' is not authorized for this action.`, 403));
    }
    next();
  };
};

// Role hierarchy check (admin can access all lower-role routes)
exports.authorizeOrSelf = (...roles) => {
  return (req, _res, next) => {
    const targetId = req.params.id || req.params.employeeId;
    const isSelf = targetId && targetId.toString() === req.user._id.toString();
    const hasRole = roles.includes(req.user.role);

    if (!isSelf && !hasRole) {
      return next(new AppError('Access denied.', 403));
    }
    next();
  };
};

// Admin-only shorthand
exports.adminOnly = exports.authorize('super_admin', 'admin');

// Management-level access
exports.managementOnly = exports.authorize('super_admin', 'admin', 'senior_manager');

// HR and above
exports.hrAndAbove = exports.authorize('super_admin', 'admin', 'senior_manager', 'hr_recruiter');
