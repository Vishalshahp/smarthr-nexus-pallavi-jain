const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/errorUtils');

const MOCK = [
  { _id: '1', message: 'Your leave request has been approved.', read: false, time: '5m ago' },
  { _id: '2', message: 'Q4 performance review is due Dec 31.', read: false, time: '1h ago' },
  { _id: '3', message: 'December payslip is ready.', read: true, time: '1d ago' },
];

router.get('/', protect, asyncHandler(async (req, res) => {
  res.json({ success: true, data: MOCK });
}));

router.patch('/:id/read', protect, asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Marked as read' });
}));
module.exports = router;
