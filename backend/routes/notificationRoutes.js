const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

router.route('/').get(protect, getNotifications);
router.route('/:id/read').patch(protect, markAsRead);

module.exports = router;