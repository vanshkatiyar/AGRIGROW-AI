const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Import call history from socket handler
const { getCallStatistics } = require('../socket/messageSocketHandler');

// Get call history
router.get('/history', protect, async (req, res) => {
  try {
    const { conversationId, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get call history from socket handler
    const stats = getCallStatistics();
    
    // For now, return mock data since we don't have persistent storage
    // In production, you would query your database for call history
    const mockCalls = [
      {
        _id: 'call_1',
        callId: 'call_123',
        participants: {
          caller: userId,
          callee: 'other_user_id'
        },
        callerInfo: {
          _id: userId,
          name: 'You',
          profileImage: null
        },
        calleeInfo: {
          _id: 'other_user_id',
          name: 'John Doe',
          profileImage: null
        },
        type: 'video',
        status: 'completed',
        duration: 120,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 120000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'call_2',
        callId: 'call_124',
        participants: {
          caller: 'other_user_id',
          callee: userId
        },
        callerInfo: {
          _id: 'other_user_id',
          name: 'Jane Smith',
          profileImage: null
        },
        calleeInfo: {
          _id: userId,
          name: 'You',
          profileImage: null
        },
        type: 'audio',
        status: 'missed',
        duration: 0,
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    // Filter by conversation if specified
    let filteredCalls = mockCalls;
    if (conversationId) {
      // In a real implementation, you would filter by conversation participants
      filteredCalls = mockCalls;
    }
    
    // Pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedCalls = filteredCalls.slice(startIndex, endIndex);
    
    res.json({
      calls: paginatedCalls,
      totalCount: filteredCalls.length,
      hasMore: endIndex < filteredCalls.length,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ error: 'Failed to fetch call history' });
  }
});

// Get call statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // In a real implementation, you would calculate these from your database
    const stats = {
      totalCalls: 0,
      totalDuration: 0,
      missedCalls: 0,
      completedCalls: 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching call stats:', error);
    res.status(500).json({ error: 'Failed to fetch call statistics' });
  }
});

module.exports = router;