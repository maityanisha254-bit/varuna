const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get all citizens with search/pagination (admin)
// @route   GET /api/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10, role = 'citizen' } = req.query;
  const query = { role };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).sort('-createdAt').skip(skip).limit(limitNum),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 },
  });
});

// @desc    Get single citizen with complaint history (admin)
// @route   GET /api/users/:id
// @access  Private (admin)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const complaints = await Complaint.find({ citizen: user._id }).sort('-createdAt');
  res.status(200).json({ success: true, data: { user, complaints } });
});

// @desc    Toggle active status of a citizen account (admin)
// @route   PUT /api/users/:id/status
// @access  Private (admin)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isActive = !user.isActive;
  await user.save();
  res.status(200).json({
    success: true,
    message: `Account ${user.isActive ? 'activated' : 'deactivated'}`,
    data: user,
  });
});

module.exports = { getUsers, getUserById, toggleUserStatus };
