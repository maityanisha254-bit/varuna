const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');

const buildPhotoUrl = (req, filename) => {
  if (!filename) return '';
  return `${req.protocol}://${req.get('host')}/uploads/complaints/${filename}`;
};

// @desc    Create a new complaint (citizen)
// @route   POST /api/complaints
// @access  Private (citizen)
const createComplaint = asyncHandler(async (req, res) => {
  const { category, severity, description, latitude, longitude, address, ward } = req.body;

  if (!category || !severity || !description) {
    res.status(400);
    throw new Error('Category, severity, and description are required');
  }
  if (!latitude || !longitude) {
    res.status(400);
    throw new Error('Location (latitude, longitude) is required');
  }

  const complaint = await Complaint.create({
    citizen: req.user._id,
    category,
    severity,
    description,
    photo: req.file ? req.file.filename : '',
    location: {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)],
      address: address || '',
      ward: ward || '',
    },
    status: 'pending',
  });

  await Notification.create({
    user: req.user._id,
    title: 'Complaint filed successfully',
    message: `Your complaint ${complaint.complaintCode} has been received and is pending review.`,
    type: 'status-update',
    relatedComplaint: complaint._id,
  });

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully',
    data: complaint,
  });
});

// @desc    Get complaints (citizen: own only, admin: all with filters/search/pagination)
// @route   GET /api/complaints
// @access  Private
const getComplaints = asyncHandler(async (req, res) => {
  const {
    status,
    category,
    severity,
    ward,
    search,
    page = 1,
    limit = 10,
    sort = '-createdAt',
    assignedWorker,
  } = req.query;

  const query = {};

  if (req.user.role === 'citizen') {
    query.citizen = req.user._id;
  }

  if (status) query.status = status;
  if (category) query.category = category;
  if (severity) query.severity = severity;
  if (ward) query['location.ward'] = ward;
  if (assignedWorker) query.assignedWorker = assignedWorker;

  if (search) {
    query.$or = [
      { complaintCode: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate('citizen', 'name email phone')
      .populate('assignedWorker', 'name phone designation')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Complaint.countDocuments(query),
  ]);

  const withUrls = complaints.map((c) => {
    const obj = c.toObject();
    obj.photoUrl = buildPhotoUrl(req, obj.photo);
    return obj;
  });

  res.status(200).json({
    success: true,
    data: withUrls,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

// @desc    Get single complaint by id
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('citizen', 'name email phone address')
    .populate('assignedWorker', 'name phone designation')
    .populate('timeline.updatedBy', 'name role');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  if (req.user.role === 'citizen' && String(complaint.citizen._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You are not authorized to view this complaint');
  }

  const obj = complaint.toObject();
  obj.photoUrl = buildPhotoUrl(req, obj.photo);
  obj.resolutionPhotoUrl = buildPhotoUrl(req, obj.resolutionPhoto);

  res.status(200).json({ success: true, data: obj });
});

// @desc    Update complaint status (admin)
// @route   PUT /api/complaints/:id/status
// @access  Private (admin)
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['pending', 'acknowledged', 'assigned', 'in-progress', 'resolved', 'rejected'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  complaint.status = status;
  complaint.timeline.push({ status, note: note || '', updatedBy: req.user._id });

  if (status === 'resolved') {
    complaint.resolvedAt = new Date();
    if (note) complaint.resolutionNote = note;
    if (complaint.assignedWorker) {
      await Worker.findByIdAndUpdate(complaint.assignedWorker, {
        $inc: { activeComplaints: -1, resolvedCount: 1 },
      });
    }
  }

  await complaint.save();

  await Notification.create({
    user: complaint.citizen,
    title: `Complaint ${complaint.complaintCode} update`,
    message: `Status changed to "${status}"${note ? `: ${note}` : ''}`,
    type: 'status-update',
    relatedComplaint: complaint._id,
  });

  res.status(200).json({ success: true, message: 'Status updated', data: complaint });
});

// @desc    Assign complaint to a worker (admin)
// @route   PUT /api/complaints/:id/assign
// @access  Private (admin)
const assignComplaint = asyncHandler(async (req, res) => {
  const { workerId } = req.body;

  if (!workerId) {
    res.status(400);
    throw new Error('workerId is required');
  }

  const [complaint, worker] = await Promise.all([
    Complaint.findById(req.params.id),
    Worker.findById(workerId),
  ]);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  if (!worker) {
    res.status(404);
    throw new Error('Worker not found');
  }

  // free up previously assigned worker's count, if reassigning
  if (complaint.assignedWorker && String(complaint.assignedWorker) !== String(workerId)) {
    await Worker.findByIdAndUpdate(complaint.assignedWorker, { $inc: { activeComplaints: -1 } });
  }

  complaint.assignedWorker = workerId;
  complaint.assignedAt = new Date();
  complaint.status = 'assigned';
  complaint.timeline.push({
    status: 'assigned',
    note: `Assigned to ${worker.name} (${worker.designation})`,
    updatedBy: req.user._id,
  });
  await complaint.save();

  await Worker.findByIdAndUpdate(workerId, { $inc: { activeComplaints: 1 }, status: 'on-duty' });

  await Notification.create({
    user: complaint.citizen,
    title: `Complaint ${complaint.complaintCode} assigned`,
    message: `A field worker has been assigned to your complaint.`,
    type: 'assignment',
    relatedComplaint: complaint._id,
  });

  res.status(200).json({ success: true, message: 'Worker assigned', data: complaint });
});

// @desc    Delete a complaint (admin only, e.g. spam/duplicate)
// @route   DELETE /api/complaints/:id
// @access  Private (admin)
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  await complaint.deleteOne();
  res.status(200).json({ success: true, message: 'Complaint deleted' });
});

// @desc    Get all complaint locations for map view (admin)
// @route   GET /api/complaints/map/locations
// @access  Private (admin)
const getMapLocations = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;

  const complaints = await Complaint.find(query)
    .select('complaintCode category severity status location createdAt')
    .limit(1000);

  res.status(200).json({ success: true, data: complaints });
});

// @desc    Analytics summary for dashboard (admin)
// @route   GET /api/complaints/analytics/summary
// @access  Private (admin)
const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const [statusCounts, categoryCounts, severityCounts, total, resolved, last7days] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'resolved' }),
    Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const avgResolutionAgg = await Complaint.aggregate([
    { $match: { status: 'resolved', resolvedAt: { $ne: null } } },
    {
      $project: {
        hours: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60] },
      },
    },
    { $group: { _id: null, avgHours: { $avg: '$hours' } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      resolved,
      resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
      avgResolutionHours: avgResolutionAgg[0] ? Math.round(avgResolutionAgg[0].avgHours * 10) / 10 : 0,
      statusCounts: statusCounts.map((s) => ({ status: s._id, count: s.count })),
      categoryCounts: categoryCounts.map((c) => ({ category: c._id, count: c.count })),
      severityCounts: severityCounts.map((s) => ({ severity: s._id, count: s.count })),
      trend7Days: last7days.map((d) => ({ date: d._id, count: d.count })),
    },
  });
});

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  getMapLocations,
  getAnalyticsSummary,
};
