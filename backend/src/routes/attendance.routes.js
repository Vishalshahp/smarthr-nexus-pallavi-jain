const express = require('express');
const router = express.Router();
const { protect, hrAndAbove } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/errorUtils');
const Attendance = require('../models/Attendance.model');

// GET today's record for current user
router.get('/today', protect, asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const record = await Attendance.findOne({ employee: req.user._id, date: { $gte: today } });
  res.json({ success: true, data: record });
}));

// POST check-in
router.post('/checkin', protect, asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await Attendance.findOne({ employee: req.user._id, date: { $gte: today } });
  if (existing?.checkIn) return res.status(400).json({ success: false, message: 'Already checked in today' });

  const now = new Date();
  const isLate = now.getHours() >= 9 && now.getMinutes() > 15;

  const record = await Attendance.findOneAndUpdate(
    { employee: req.user._id, date: today },
    {
      $set: {
        'checkIn.time': now,
        'checkIn.method': req.body.method || 'manual',
        'checkIn.location': req.body.location,
        status: isLate ? 'late' : 'present',
        workMode: req.body.workMode || 'office',
      },
    },
    { upsert: true, new: true }
  );

  // Emit real-time event
  if (req.io) req.io.to('role:admin').emit('attendance:live', { userId: req.user._id, action: 'checkin', time: now });

  res.json({ success: true, data: record, message: `Checked in at ${now.toLocaleTimeString()}` });
}));

// POST check-out
router.post('/checkout', protect, asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const record = await Attendance.findOne({ employee: req.user._id, date: { $gte: today } });
  if (!record?.checkIn) return res.status(400).json({ success: false, message: 'No check-in found for today' });
  if (record.checkOut?.time) return res.status(400).json({ success: false, message: 'Already checked out' });

  const now = new Date();
  record.checkOut = { time: now, method: req.body.method || 'manual', location: req.body.location };
  await record.save();

  if (req.io) req.io.to('role:admin').emit('attendance:live', { userId: req.user._id, action: 'checkout', time: now });

  res.json({ success: true, data: record, message: `Checked out at ${now.toLocaleTimeString()}` });
}));

// GET attendance history
router.get('/', protect, asyncHandler(async (req, res) => {
  const { employeeId, startDate, endDate, page = 1, limit = 31 } = req.query;
  const query = {};

  // Non-admins can only see their own
  if (req.user.role === 'employee') query.employee = req.user._id;
  else if (employeeId) query.employee = employeeId;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const records = await Attendance.find(query)
    .populate('employee', 'firstName lastName employeeId')
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Attendance.countDocuments(query);
  res.json({ success: true, data: records, total });
}));

// GET attendance report/stats
router.get('/report', protect, hrAndAbove, asyncHandler(async (req, res) => {
  const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
  const startDate = new Date(year, month - 1, 1);
  const endDate   = new Date(year, month, 0);

  const stats = await Attendance.aggregate([
    { $match: { date: { $gte: startDate, $lte: endDate } } },
    { $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgHours: { $avg: '$totalHours' },
    }},
  ]);

  res.json({ success: true, data: { stats, month, year } });
}));

module.exports = router;
