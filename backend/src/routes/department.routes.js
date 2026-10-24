const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/errorUtils');
const mongoose = require('mongoose');

const deptSchema = new mongoose.Schema({ name: String, code: String, head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, description: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
const Department = mongoose.models.Department || mongoose.model('Department', deptSchema);

router.get('/', protect, asyncHandler(async (req, res) => {
  const depts = await Department.find({ isActive: true }).populate('head', 'firstName lastName');
  res.json({ success: true, data: depts });
}));
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const dept = await Department.create(req.body);
  res.status(201).json({ success: true, data: dept });
}));
module.exports = router;
