const express = require('express');
const { getUsers, getUserById, toggleUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/status', toggleUserStatus);

module.exports = router;
