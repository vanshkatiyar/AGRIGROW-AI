const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  conversationRateLimit, 
  searchRateLimit 
} = require('../middleware/rateLimitMiddleware');
const {
  getConversations,
  getConversationMessages,
  createConversation,
  markMessageAsRead,
  markConversationAsRead,
  deleteMessage,
  searchMessages,
  getUsersForMessaging
} = require('../controllers/messageController');

const router = express.Router();

// Conversation routes
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, conversationRateLimit, createConversation);
router.get('/conversations/:conversationId/messages', protect, getConversationMessages);
router.put('/conversations/:conversationId/read', protect, markConversationAsRead);

// Message routes
router.put('/messages/:messageId/read', protect, markMessageAsRead);
router.delete('/messages/:messageId', protect, deleteMessage);

// Search routes
router.get('/search', protect, searchRateLimit, searchMessages);

// User routes for messaging
router.get('/users', protect, getUsersForMessaging);

module.exports = router;