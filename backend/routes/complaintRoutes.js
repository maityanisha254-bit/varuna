const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  getMapLocations,
  getAnalyticsSummary,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/map/locations', protect, authorize('admin'), getMapLocations);
router.get('/analytics/summary', protect, authorize('admin'), getAnalyticsSummary);

router
  .route('/')
  .post(protect, authorize('citizen'), upload.single('photo'), createComplaint)
  .get(protect, getComplaints);

router
  .route('/:id')
  .get(protect, getComplaintById)
  .delete(protect, authorize('admin'), deleteComplaint);

router.put('/:id/status', protect, authorize('admin'), updateComplaintStatus);
router.put('/:id/assign', protect, authorize('admin'), assignComplaint);

module.exports = router;
