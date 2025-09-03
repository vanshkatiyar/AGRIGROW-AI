const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Group = require('../models/Group');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all conversations (1-on-1 and groups merged) for the logged-in user
router.get('/conversations', protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.user._id })
            .populate('participants', 'name profileImage')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        const groups = await Group.find({ participants: req.user._id })
            .populate('participants', 'name profileImage')
            .sort({ updatedAt: -1 });
        
        // You might want to format this data further before sending
        res.json({ conversations, groups });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Get messages for a specific conversation or group
router.get('/messages/:id', protect, async (req, res) => {
    try {
        const { type } = req.query; // type will be 'group' or undefined
        const filter = type === 'group' 
            ? { groupId: req.params.id }
            : { conversationId: req.params.id }; // This assumes a conversation model linking messages

        // This part needs to be adapted based on how you link messages to conversations
        // For now, let's just fetch messages between two users as a proxy
        const messages = await Message.find({
            $or: [
                { senderId: req.user._id, recipientId: req.params.id },
                { senderId: req.params.id, recipientId: req.user._id }
            ]
        }).sort('sentAt').populate('senderId', 'name profileImage');
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Create a new group
router.post('/groups', protect, async (req, res) => {
    const { name, participants } = req.body;
    try {
        const newGroup = await Group.create({
            name,
            participants: [...participants, req.user._id],
            createdBy: req.user._id
        });
        res.status(201).json(newGroup);
    } catch (error) {
         res.status(500).json({ message: "Server Error" });
    }
});


module.exports = router;