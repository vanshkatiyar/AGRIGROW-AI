const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all conversations (1-on-1) and groups for the logged-in user
router.get('/conversations', protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.user._id })
            .populate({ path: 'participants', select: 'name profileImage' })
            .populate({ path: 'lastMessage', populate: { path: 'senderId', select: 'name' } })
            .sort({ updatedAt: -1 });

        const groups = await Group.find({ participants: req.user._id })
            .populate('participants', 'name profileImage')
            .sort({ updatedAt: -1 });
        
        res.json({ conversations, groups });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get messages for a specific conversation ID (can be user or group)
router.get('/messages/:id', protect, async (req, res) => {
    try {
        const { type } = req.query;
        let messages;

        if (type === 'group') {
            messages = await Message.find({ groupId: req.params.id })
                .populate('senderId', 'name profileImage')
                .sort('createdAt');
        } else {
            const conversation = await Conversation.findOne({ participants: { $all: [req.user._id, req.params.id] } });
            if (!conversation) return res.json([]);
            
            messages = await Message.find({ conversationId: conversation._id })
                .populate('senderId', 'name profileImage')
                .sort('createdAt');
        }
        
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;