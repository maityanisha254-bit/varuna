const express = require('express');
const {
  createWorker,
  getWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
} = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').post(createWorker).get(getWorkers);
router.route('/:id').get(getWorkerById).put(updateWorker).delete(deleteWorker);

module.exports = router;
