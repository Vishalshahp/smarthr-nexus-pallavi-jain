const express = require('express');
const router = express.Router();
const { protect, managementOnly } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/errorUtils');

router.get('/attendance', protect, managementOnly, asyncHandler(async (req, res) => {
  res.json({ success: true, data: { message: 'Attendance report data' } });
}));
router.get('/payroll', protect, managementOnly, asyncHandler(async (req, res) => {
  res.json({ success: true, data: { message: 'Payroll report data' } });
}));
module.exports = router;
