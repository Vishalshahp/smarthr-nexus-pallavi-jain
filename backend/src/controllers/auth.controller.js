const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const Employee = require('../models/Employee.model');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');
const { sendEmail } = require('../services/notification/email.service');
const { AppError, asyncHandler } = require('../utils/errorUtils');

// Generate tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  return { accessToken, refreshToken };
};

const getStoredRefreshToken = async (userId) => {
  if (redisClient?.isReady) {
    try {
      const token = await redisClient.get(`refresh:${userId}`);
      if (token) return token;
    } catch (err) {
      logger.warn(`Redis read failed for refresh token: ${err.message}`);
    }
  }

  const user = await User.findById(userId).select('+refreshToken');
  return user?.refreshToken || null;
};

const storeRefreshToken = async (userId, refreshToken) => {
  if (redisClient?.isReady) {
    try {
      await redisClient.setEx(`refresh:${userId}`, 30 * 24 * 60 * 60, refreshToken);
      return;
    } catch (err) {
      logger.warn(`Redis write failed for refresh token, falling back to user document: ${err.message}`);
    }
  }

  await User.findByIdAndUpdate(userId, { refreshToken });
};

const deleteStoredRefreshToken = async (userId) => {
  if (redisClient?.isReady) {
    try {
      await redisClient.del(`refresh:${userId}`);
      return;
    } catch (err) {
      logger.warn(`Redis delete failed for refresh token: ${err.message}`);
    }
  }

  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

// Send token response
const sendTokenResponse = async (user, statusCode, res) => {
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  await storeRefreshToken(user._id, refreshToken);

  // Update last login
  await User.findByIdAndUpdate(user._id, {
    lastLogin: new Date(),
    loginAttempts: 0,
    $unset: { lockUntil: 1 },
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  res.status(statusCode).json({
    success: true,
    accessToken,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    user: userObj,
  });
};

// @route   POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email, isActive: true }).select(
    '+password +loginAttempts +lockUntil'
  );

  if (!user) return next(new AppError('Invalid credentials', 401));

  // Check lock
  if (user.isLocked) {
    return next(new AppError('Account locked due to too many failed attempts. Try again in 2 hours.', 423));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incLoginAttempts();
    return next(new AppError('Invalid credentials', 401));
  }

  // Role check: log note if tab differs, but allow authentication
  if (role && user.role !== role) {
    logger.info(`User ${user.email} logged in with actual role ${user.role} (tab had ${role})`);
  }

  logger.info(`User logged in: ${user.email} [${user.role}]`);
  await sendTokenResponse(user, 200, res);
});

// @route   POST /api/v1/auth/register
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role, department, position } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError('Email already registered', 409));

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'employee',
    department,
    position,
  });

  // Create employee profile
  await Employee.create({ user: user._id });

  // Send welcome email
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  await User.findByIdAndUpdate(user._id, {
    emailVerificationToken: hashedToken,
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Welcome to SmartHR Nexus - Verify Your Email',
    template: 'welcome',
    data: { name: user.firstName, verifyUrl },
  }).catch((err) => logger.error(`Email send failed: ${err.message}`));

  logger.info(`New user registered: ${user.email} [${user.role}]`);
  await sendTokenResponse(user, 201, res);
});

// @route   POST /api/v1/auth/refresh-token
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) return next(new AppError('No refresh token', 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return next(new AppError('Invalid refresh token', 401));
  }

  const storedToken = await getStoredRefreshToken(decoded.id);
  if (!storedToken || storedToken !== token) {
    return next(new AppError('Refresh token expired or revoked', 401));
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) return next(new AppError('User not found or inactive', 401));

  await sendTokenResponse(user, 200, res);
});

// @route   POST /api/v1/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  await deleteStoredRefreshToken(req.user.id);
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

// @route   GET /api/v1/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('department', 'name code');
  res.json({ success: true, data: user });
});

// @route   PUT /api/v1/auth/change-password
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) return next(new AppError('User not found', 404));

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return next(new AppError('Current password is incorrect', 400));

  user.password = newPassword;
  await user.save();

  // Revoke all existing tokens
  await deleteStoredRefreshToken(user._id);

  await sendTokenResponse(user, 200, res);
});

// @route   POST /api/v1/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No user found with that email', 404));

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await User.findByIdAndUpdate(user._id, {
    passwordResetToken: hashedToken,
    passwordResetExpires: Date.now() + 10 * 60 * 1000, // 10 min
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'SmartHR Nexus - Password Reset Request',
    template: 'resetPassword',
    data: { name: user.firstName, resetUrl },
  });

  res.json({ success: true, message: 'Password reset email sent' });
});

// @route   POST /api/v1/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) return next(new AppError('Invalid or expired reset token', 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
});
