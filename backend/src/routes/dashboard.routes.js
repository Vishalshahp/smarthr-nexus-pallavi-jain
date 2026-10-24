const express = require('express');
const router = express.Router();
const { protect, adminOnly, managementOnly } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/errorUtils');
const User = require('../models/User.model');
const Attendance = require('../models/Attendance.model');

router.get('/admin', protect, managementOnly, asyncHandler(async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [totalEmployees, presentToday, activeJobs] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Attendance.countDocuments({ date: { $gte: today }, status: { $in: ['present', 'late'] } }),
    Promise.resolve(47),
  ]);
  res.json({ success: true, data: { totalEmployees, presentToday, activeJobs } });
}));

router.get('/manager', protect, asyncHandler(async (req, res) => {
  res.json({ success: true, data: { teamSize: 12, pendingLeaves: 3, upcomingReviews: 5 } });
}));

router.get('/employee', protect, asyncHandler(async (req, res) => {
  res.json({ success: true, data: { attendancePercent: 87, leaveBalance: 14, performanceScore: 4.6 } });
}));

module.exports = router;
