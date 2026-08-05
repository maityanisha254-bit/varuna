const asyncHandler = require('express-async-handler');
const Worker = require('../models/Worker');
const Complaint = require('../models/Complaint');

// @desc    Create worker (admin)
// @route   POST /api/workers
// @access  Private (admin)
const createWorker = asyncHandler(async (req, res) => {
  const { name, phone, email, designation, ward, zone } = req.body;

  if (!name || !phone || !ward) {
    res.status(400);
    throw new Error('Name, phone, and ward are required');
  }

  const worker = await Worker.create({ name, phone, email, designation, ward, zone });
  res.status(201).json({ success: true, message: 'Worker added', data: worker });
});

// @desc    Get all workers with filters/search/pagination
// @route   GET /api/workers
// @access  Private (admin)
const getWorkers = asyncHandler(async (req, res) => {
  const { search, status, ward, page = 1, limit = 10 } = req.query;
  const query = {};

  if (status) query.status = status;
  if (ward) query.ward = ward;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { designation: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [workers, total] = await Promise.all([
    Worker.find(query).sort('-createdAt').skip(skip).limit(limitNum),
    Worker.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: workers,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 },
  });
});

// @desc    Get single worker + their active complaints
// @route   GET /api/workers/:id
// @access  Private (admin)
const getWorkerById = asyncHandler(async (req, res) => {
  const worker = await Worker.findById(req.params.id);
  if (!worker) {
    res.status(404);
    throw new Error('Worker not found');
  }
  const complaints = await Complaint.find({ assignedWorker: worker._id }).sort('-createdAt').limit(20);
  res.status(200).json({ success: true, data: { worker, complaints } });
});

// @desc    Update worker
// @route   PUT /api/workers/:id
// @access  Private (admin)
const updateWorker = asyncHandler(async (req, res) => {
  const worker = await Worker.findById(req.params.id);
  if (!worker) {
    res.status(404);
    throw new Error('Worker not found');
  }

  const fields = ['name', 'phone', 'email', 'designation', 'ward', 'zone', 'status', 'isActive'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) worker[f] = req.body[f];
  });

  const updated = await worker.save();
  res.status(200).json({ success: true, message: 'Worker updated', data: updated });
});

// @desc    Delete worker
// @route   DELETE /api/workers/:id
// @access  Private (admin)
const deleteWorker = asyncHandler(async (req, res) => {
  const worker = await Worker.findById(req.params.id);
  if (!worker) {
    res.status(404);
    throw new Error('Worker not found');
  }
  await worker.deleteOne();
  res.status(200).json({ success: true, message: 'Worker removed' });
});

module.exports = { createWorker, getWorkers, getWorkerById, updateWorker, deleteWorker };
