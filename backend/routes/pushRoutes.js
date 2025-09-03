const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { sendPushNotification } = require('../utils/push');

const router = express.Router();

// Subscribe a user to push notifications
router.post('/subscribe', protect, async (req, res) => {
    const { subscription } = req.body;
    try {
        await User.findByIdAndUpdate(req.user.id, { pushSubscription: JSON.stringify(subscription) });
        res.status(201).json({ message: 'Subscription saved.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save subscription.' });
    }
});

module.exports = router;