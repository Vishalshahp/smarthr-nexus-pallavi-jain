const express = require('express');
const router = express.Router();
const { protect, adminOnly, managementOnly, hrAndAbove } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/errorUtils');
const User = require('../models/User.model');
const Employee = require('../models/Employee.model');
const multer = require('multer');
const path = require('path');

// Avatar upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/avatars'),
  filename: (req, file, cb) => cb(null, `avatar-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// GET all employees
router.get('/', protect, hrAndAbove, asyncHandler(async (req, res) => {
  const { search, role, department, page = 1, limit = 12 } = req.query;
  const query = { deletedAt: null };
  if (role) query.role = role;
  if (department) query.department = department;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
      { employeeId:{ $regex: search, $options: 'i' } },
    ];
  }
  const employees = await User.find(query)
    .populate('department', 'name code')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);
  res.json({ success: true, data: employees, total, page: parseInt(page) });
}));

// GET single employee
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('department').populate('reportingManager', 'firstName lastName email');
  const employee = await Employee.findOne({ user: req.params.id });
  if (!user) return res.status(404).json({ success: false, message: 'Employee not found' });
  res.json({ success: true, data: { ...user.toObject(), employeeProfile: employee } });
}));

// POST create employee
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { password = 'SmartHR@2024', ...rest } = req.body;
  const user = await User.create({ ...rest, password });
  await Employee.create({ user: user._id });
  res.status(201).json({ success: true, data: user, message: 'Employee created successfully' });
}));

// PUT update employee
router.put('/:id', protect, hrAndAbove, asyncHandler(async (req, res) => {
  const { password, ...updateData } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  res.json({ success: true, data: user });
}));

// DELETE (soft) employee
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false, deletedAt: new Date() });
  res.json({ success: true, message: 'Employee deactivated' });
}));

// POST upload avatar
router.post('/:id/avatar', protect, upload.single('avatar'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { avatar: `/uploads/avatars/${req.file.filename}` }, { new: true });
  res.json({ success: true, data: { avatar: user.avatar } });
}));

module.exports = router;
