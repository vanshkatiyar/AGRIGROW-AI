const Notification = require('../models/Notification');

const createNotification = async (userId, message, link) => {
    try {
        const notification = new Notification({
            user: userId,
            message,
            link
        });
        await notification.save();
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead
};