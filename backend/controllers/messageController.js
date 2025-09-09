const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get user's conversations with pagination
const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const conversations = await Conversation.findUserConversations(userId, page, limit);

    // Add unread count for current user
    const conversationsWithUnread = conversations.map(conv => {
      const convObj = conv.toObject();
      convObj.unreadCount = conv.getUnreadCount(userId);
      return convObj;
    });

    res.json({
      conversations: conversationsWithUnread,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: conversations.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ 
      message: 'Failed to fetch conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get messages for a specific conversation
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    // Verify user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    const messages = await Message.findByConversation(conversationId, page, limit);

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user._id;

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if recipient allows messages from sender
    if (!recipient.canReceiveMessagesFrom(senderId)) {
      return res.status(403).json({ message: 'Recipient does not accept messages from you' });
    }

    // Create or get existing conversation
    const conversation = await Conversation.createConversation(senderId, recipientId);

    // Populate participants
    await conversation.populate('participants', 'name profileImage isOnline lastSeen');

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ 
      message: 'Failed to create conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only recipient can mark message as read
    if (message.recipientId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await message.markAsRead();

    // Update conversation unread count
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation) {
      await conversation.resetUnreadCount(userId);
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ 
      message: 'Failed to mark message as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mark all messages in conversation as read
const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    // Mark all messages as read
    await Message.markConversationAsRead(conversationId, userId);
    
    // Reset unread count
    await conversation.resetUnreadCount(userId);

    res.json({ message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ 
      message: 'Failed to mark conversation as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await message.softDelete();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search messages
const searchMessages = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    // Get user's conversations
    const userConversations = await Conversation.find({ participants: userId }).select('_id');
    const conversationIds = userConversations.map(conv => conv._id);

    // Search messages in user's conversations
    const messages = await Message.find({
      conversationId: { $in: conversationIds },
      content: { $regex: query.trim(), $options: 'i' },
      deletedAt: { $exists: false }
    })
    .populate('senderId', 'name profileImage')
    .populate('recipientId', 'name profileImage')
    .populate('conversationId', 'participants')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      messages,
      query: query.trim(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ 
      message: 'Failed to search messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get users available for messaging
const getUsersForMessaging = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const users = await User.findUsersForMessaging(userId, search, page, limit);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: users.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users for messaging:', error);
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getConversations,
  getConversationMessages,
  createConversation,
  markMessageAsRead,
  markConversationAsRead,
  deleteMessage,
  searchMessages,
  getUsersForMessaging
};