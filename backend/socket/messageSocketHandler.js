const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { socketRateLimiter } = require('../middleware/rateLimitMiddleware');

// Store online users and their typing status
const onlineUsers = new Map();
const typingUsers = new Map(); // conversationId -> Set of userIds

// Authenticate socket connection
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

// Handle user connection
const handleConnection = async (socket, io) => {
  console.log(`User ${socket.userId} connected with socket ${socket.id}`);
  
  // Add user to online users
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    userId: socket.userId,
    connectedAt: new Date()
  });

  // Update user online status in database
  await User.setUserOnline(socket.userId);

  // Broadcast user online status to relevant users
  broadcastUserStatus(socket.userId, true, io);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);
};

// Handle user adding (legacy support)
const handleAddUser = async (socket, userId, io) => {
  if (socket.userId !== userId) {
    socket.emit('error', { message: 'User ID mismatch' });
    return;
  }

  console.log(`User ${userId} confirmed online status`);
  
  // Ensure user is in online users map
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, {
      socketId: socket.id,
      userId: userId,
      connectedAt: new Date()
    });
  }
};

// Handle sending messages
const handleSendMessage = async (socket, data, io) => {
  try {
    const { recipientId, content, conversationId } = data;
    const senderId = socket.userId;

    // Rate limiting check
    if (!socketRateLimiter.checkLimit(senderId, 'sendMessage', 30, 60000)) {
      socket.emit('messageError', { message: 'Rate limit exceeded. Please slow down.' });
      return;
    }

    // Validate input
    if (!recipientId || !content || content.trim().length === 0) {
      socket.emit('messageError', { message: 'Invalid message data' });
      return;
    }

    if (content.length > 1000) {
      socket.emit('messageError', { message: 'Message too long' });
      return;
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(senderId)) {
        socket.emit('messageError', { message: 'Invalid conversation' });
        return;
      }
    } else {
      conversation = await Conversation.createConversation(senderId, recipientId);
    }

    // Check if recipient allows messages from sender
    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.canReceiveMessagesFrom(senderId)) {
      socket.emit('messageError', { message: 'Cannot send message to this user' });
      return;
    }

    // Create message
    const message = new Message({
      senderId,
      recipientId,
      conversationId: conversation._id,
      content: content.trim(),
      isDelivered: onlineUsers.has(recipientId)
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    await conversation.updateLastActivity();
    await conversation.incrementUnreadCount(recipientId);

    // Populate message for sending
    await message.populate('senderId', 'name profileImage');
    await message.populate('recipientId', 'name profileImage');

    // Send to recipient if online
    const recipientSocket = onlineUsers.get(recipientId);
    if (recipientSocket) {
      io.to(`user_${recipientId}`).emit('newMessage', message);
      
      // Mark as delivered
      message.isDelivered = true;
      await message.save();
      
      // Confirm delivery to sender
      socket.emit('messageDelivered', { messageId: message._id });
    }

    // Send confirmation to sender
    socket.emit('messageSent', message);

    console.log(`Message sent from ${senderId} to ${recipientId}`);
  } catch (error) {
    console.error('Error handling sendMessage:', error);
    socket.emit('messageError', { message: 'Failed to send message' });
  }
};

// Handle joining conversation room
const handleJoinConversation = async (socket, conversationId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation || !conversation.participants.includes(socket.userId)) {
      socket.emit('error', { message: 'Access denied to conversation' });
      return;
    }

    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    
    socket.emit('joinedConversation', { conversationId });
  } catch (error) {
    console.error('Error joining conversation:', error);
    socket.emit('error', { message: 'Failed to join conversation' });
  }
};

// Handle leaving conversation room
const handleLeaveConversation = (socket, conversationId) => {
  socket.leave(`conversation_${conversationId}`);
  console.log(`User ${socket.userId} left conversation ${conversationId}`);
  
  socket.emit('leftConversation', { conversationId });
};

// Handle marking message as read
const handleMarkAsRead = async (socket, messageId, io) => {
  try {
    const message = await Message.findById(messageId);
    
    if (!message || message.recipientId.toString() !== socket.userId) {
      socket.emit('error', { message: 'Access denied' });
      return;
    }

    await message.markAsRead();

    // Update conversation unread count
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation) {
      await conversation.resetUnreadCount(socket.userId);
    }

    // Notify sender that message was read
    const senderSocket = onlineUsers.get(message.senderId.toString());
    if (senderSocket) {
      io.to(`user_${message.senderId}`).emit('messageRead', { 
        messageId: message._id,
        readBy: socket.userId 
      });
    }

    socket.emit('messageMarkedAsRead', { messageId });
  } catch (error) {
    console.error('Error marking message as read:', error);
    socket.emit('error', { message: 'Failed to mark message as read' });
  }
};

// Handle typing indicators
const handleTyping = (socket, data, io) => {
  const { conversationId } = data;
  const userId = socket.userId;

  if (!conversationId) return;

  // Add user to typing users for this conversation
  if (!typingUsers.has(conversationId)) {
    typingUsers.set(conversationId, new Set());
  }
  typingUsers.get(conversationId).add(userId);

  // Broadcast typing to other participants in conversation
  socket.to(`conversation_${conversationId}`).emit('userTyping', {
    conversationId,
    userId,
    isTyping: true
  });

  console.log(`User ${userId} is typing in conversation ${conversationId}`);
};

// Handle stop typing
const handleStopTyping = (socket, data, io) => {
  const { conversationId } = data;
  const userId = socket.userId;

  if (!conversationId) return;

  // Remove user from typing users
  if (typingUsers.has(conversationId)) {
    typingUsers.get(conversationId).delete(userId);
    
    // Clean up empty sets
    if (typingUsers.get(conversationId).size === 0) {
      typingUsers.delete(conversationId);
    }
  }

  // Broadcast stop typing to other participants
  socket.to(`conversation_${conversationId}`).emit('userTyping', {
    conversationId,
    userId,
    isTyping: false
  });

  console.log(`User ${userId} stopped typing in conversation ${conversationId}`);
};

// Store active calls
const activeCalls = new Map(); // callId -> { caller, callee, type, status }

// Store call history for debugging and analytics
const callHistory = new Map(); // callId -> call record

// Cleanup interval for old calls
let cleanupInterval = null;

// Handle call initiation
const handleCallOffer = async (socket, data, io) => {
  try {
    const { recipientId, offer, callType } = data;
    const callerId = socket.userId;

    // Validate input data
    if (!recipientId || !offer || !callType) {
      socket.emit('callFailed', { 
        error: 'Invalid call data provided',
        callId: null 
      });
      return;
    }

    if (!['audio', 'video'].includes(callType)) {
      socket.emit('callFailed', { 
        error: 'Invalid call type',
        callId: null 
      });
      return;
    }

    // Check if caller is trying to call themselves
    if (callerId === recipientId) {
      socket.emit('callFailed', { 
        error: 'Cannot call yourself',
        callId: null 
      });
      return;
    }

    // Check if caller is already in a call
    const existingCall = Array.from(activeCalls.values()).find(
      call => (call.caller === callerId || call.callee === callerId) && 
               call.status !== 'ended'
    );
    
    if (existingCall) {
      socket.emit('callFailed', { 
        error: 'You are already in a call',
        callId: null 
      });
      return;
    }

    // Check if recipient is already in a call
    const recipientInCall = Array.from(activeCalls.values()).find(
      call => (call.caller === recipientId || call.callee === recipientId) && 
               call.status !== 'ended'
    );
    
    if (recipientInCall) {
      socket.emit('callFailed', { 
        error: 'User is busy',
        callId: null 
      });
      return;
    }

    // Generate unique call ID
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store call information
    activeCalls.set(callId, {
      callId,
      caller: callerId,
      callee: recipientId,
      type: callType,
      status: 'ringing',
      startTime: new Date(),
      offer: offer // Store offer for potential retry
    });

    // Send call offer to recipient
    const recipientSocket = onlineUsers.get(recipientId);
    if (recipientSocket) {
      io.to(`user_${recipientId}`).emit('incomingCall', {
        callId,
        callerId,
        callerName: socket.user.name,
        callerAvatar: socket.user.profileImage,
        callType,
        offer
      });

      // Confirm to caller that call was initiated
      socket.emit('callInitiated', { callId, recipientId, callType });

      // Set call timeout (30 seconds)
      setTimeout(() => {
        const call = activeCalls.get(callId);
        if (call && call.status === 'ringing') {
          console.log(`Call ${callId} timed out`);
          
          // Notify both parties
          io.to(`user_${callerId}`).emit('callFailed', { 
            error: 'Call timed out',
            callId 
          });
          io.to(`user_${recipientId}`).emit('callEnded', { 
            callId, 
            reason: 'timeout' 
          });
          
          // Clean up
          activeCalls.delete(callId);
        }
      }, 30000);

    } else {
      // Recipient is offline
      socket.emit('callFailed', { 
        error: 'User is offline',
        callId,
        recipientId 
      });
      activeCalls.delete(callId);
    }
  } catch (error) {
    console.error('Error handling call offer:', error);
    socket.emit('callFailed', { 
      error: 'Failed to initiate call',
      callId: null 
    });
  }
};

// Handle call answer
const handleCallAnswer = async (socket, data, io) => {
  try {
    const { callId, answer } = data;

    // Validate input
    if (!callId || !answer) {
      socket.emit('callFailed', { 
        error: 'Invalid answer data',
        callId 
      });
      return;
    }

    const call = activeCalls.get(callId);

    if (!call) {
      socket.emit('callFailed', { 
        error: 'Call not found',
        callId 
      });
      return;
    }

    if (call.callee !== socket.userId) {
      socket.emit('callFailed', { 
        error: 'Unauthorized to answer this call',
        callId 
      });
      return;
    }

    if (call.status !== 'ringing') {
      socket.emit('callFailed', { 
        error: `Call is not in ringing state (current: ${call.status})`,
        callId 
      });
      return;
    }

    // Update call status
    call.status = 'connecting';
    call.answerTime = new Date();

    // Send answer to caller
    io.to(`user_${call.caller}`).emit('callAnswered', {
      callId,
      answer
    });

    console.log(`Call ${callId} answered by ${socket.userId}`);

    // Set connection timeout (10 seconds to establish connection)
    setTimeout(() => {
      const currentCall = activeCalls.get(callId);
      if (currentCall && currentCall.status === 'connecting') {
        console.log(`Call ${callId} connection timed out`);
        
        // Notify both parties
        io.to(`user_${call.caller}`).emit('callFailed', { 
          error: 'Connection timeout',
          callId 
        });
        io.to(`user_${call.callee}`).emit('callFailed', { 
          error: 'Connection timeout',
          callId 
        });
        
        // Clean up
        activeCalls.delete(callId);
      }
    }, 10000);

  } catch (error) {
    console.error('Error handling call answer:', error);
    socket.emit('callFailed', { 
      error: 'Failed to answer call',
      callId: data?.callId || null 
    });
  }
};

// Handle call rejection
const handleCallReject = async (socket, data, io) => {
  try {
    const { callId } = data;

    if (!callId) {
      console.warn('Call rejection without callId');
      return;
    }

    const call = activeCalls.get(callId);

    if (!call) {
      console.warn(`Call ${callId} not found for rejection`);
      return;
    }

    // Verify the user is authorized to reject this call
    if (call.callee !== socket.userId) {
      console.warn(`User ${socket.userId} tried to reject call ${callId} but is not the callee`);
      return;
    }

    // Update call status
    call.status = 'rejected';
    call.endTime = new Date();

    // Notify caller of rejection
    io.to(`user_${call.caller}`).emit('callRejected', { callId });

    // Save call to history
    saveCallToHistory(call);

    // Clean up call
    activeCalls.delete(callId);

    console.log(`Call ${callId} rejected by ${socket.userId}`);
  } catch (error) {
    console.error('Error handling call rejection:', error);
  }
};

// Handle call end
const handleCallEnd = async (socket, data, io) => {
  try {
    const { callId } = data;

    if (!callId) {
      console.warn('Call end without callId');
      return;
    }

    const call = activeCalls.get(callId);

    if (!call) {
      console.warn(`Call ${callId} not found for ending`);
      return;
    }

    // Verify the user is authorized to end this call
    if (call.caller !== socket.userId && call.callee !== socket.userId) {
      console.warn(`User ${socket.userId} tried to end call ${callId} but is not a participant`);
      return;
    }

    // Update call status
    call.status = 'ended';
    call.endTime = new Date();
    call.endedBy = socket.userId;

    // Calculate call duration if it was connected
    if (call.connectedTime) {
      call.duration = Math.floor((call.endTime - call.connectedTime) / 1000);
    }

    // Notify both parties that call ended
    io.to(`user_${call.caller}`).emit('callEnded', { 
      callId,
      endedBy: socket.userId,
      duration: call.duration || 0
    });
    io.to(`user_${call.callee}`).emit('callEnded', { 
      callId,
      endedBy: socket.userId,
      duration: call.duration || 0
    });

    console.log(`Call ${callId} ended by ${socket.userId} after ${call.duration || 0} seconds`);

    // Save call to history
    saveCallToHistory(call);

    // Clean up call (keep for a short time for potential logging)
    setTimeout(() => {
      activeCalls.delete(callId);
    }, 5000);

  } catch (error) {
    console.error('Error handling call end:', error);
  }
};

// Handle ICE candidates
const handleIceCandidate = async (socket, data, io) => {
  try {
    const { callId, candidate } = data;

    if (!callId || !candidate) {
      console.warn('ICE candidate without required data');
      return;
    }

    const call = activeCalls.get(callId);

    if (!call) {
      console.warn(`Call ${callId} not found for ICE candidate`);
      return;
    }

    // Verify the user is a participant in this call
    if (call.caller !== socket.userId && call.callee !== socket.userId) {
      console.warn(`User ${socket.userId} tried to send ICE candidate for call ${callId} but is not a participant`);
      return;
    }

    // Forward ICE candidate to the other party
    const otherUserId = call.caller === socket.userId ? call.callee : call.caller;
    io.to(`user_${otherUserId}`).emit('iceCandidate', {
      callId,
      candidate
    });
  } catch (error) {
    console.error('Error handling ICE candidate:', error);
  }
};

// Handle mute status changes
const handleMuteStatusChanged = async (socket, data, io) => {
  try {
    const { callId, isMuted } = data;

    if (!callId || typeof isMuted !== 'boolean') {
      console.warn('Mute status change without required data');
      return;
    }

    const call = activeCalls.get(callId);

    if (!call) {
      console.warn(`Call ${callId} not found for mute status change`);
      return;
    }

    // Verify the user is a participant in this call
    if (call.caller !== socket.userId && call.callee !== socket.userId) {
      console.warn(`User ${socket.userId} tried to change mute status for call ${callId} but is not a participant`);
      return;
    }

    // Forward mute status to the other party
    const otherUserId = call.caller === socket.userId ? call.callee : call.caller;
    io.to(`user_${otherUserId}`).emit('muteStatusChanged', {
      callId,
      userId: socket.userId,
      isMuted
    });

    console.log(`User ${socket.userId} ${isMuted ? 'muted' : 'unmuted'} in call ${callId}`);
  } catch (error) {
    console.error('Error handling mute status change:', error);
  }
};

// Handle video status changes
const handleVideoStatusChanged = async (socket, data, io) => {
  try {
    const { callId, isVideoEnabled } = data;

    if (!callId || typeof isVideoEnabled !== 'boolean') {
      console.warn('Video status change without required data');
      return;
    }

    const call = activeCalls.get(callId);

    if (!call) {
      console.warn(`Call ${callId} not found for video status change`);
      return;
    }

    // Verify the user is a participant in this call
    if (call.caller !== socket.userId && call.callee !== socket.userId) {
      console.warn(`User ${socket.userId} tried to change video status for call ${callId} but is not a participant`);
      return;
    }

    // Forward video status to the other party
    const otherUserId = call.caller === socket.userId ? call.callee : call.caller;
    io.to(`user_${otherUserId}`).emit('videoStatusChanged', {
      callId,
      userId: socket.userId,
      isVideoEnabled
    });

    console.log(`User ${socket.userId} ${isVideoEnabled ? 'enabled' : 'disabled'} video in call ${callId}`);
  } catch (error) {
    console.error('Error handling video status change:', error);
  }
};

// Handle call connection established (when WebRTC connection is successful)
const handleCallConnected = async (socket, data, io) => {
  try {
    const { callId } = data;

    if (!callId) {
      console.warn('Call connected without callId');
      return;
    }

    const call = activeCalls.get(callId);

    if (!call) {
      console.warn(`Call ${callId} not found for connection confirmation`);
      return;
    }

    // Verify the user is a participant in this call
    if (call.caller !== socket.userId && call.callee !== socket.userId) {
      console.warn(`User ${socket.userId} tried to confirm connection for call ${callId} but is not a participant`);
      return;
    }

    // Update call status to connected if both parties confirm
    if (call.status === 'connecting') {
      call.status = 'connected';
      call.connectedTime = new Date();
      
      console.log(`Call ${callId} successfully connected`);
      
      // Notify both parties that connection is established
      io.to(`user_${call.caller}`).emit('callConnected', { callId });
      io.to(`user_${call.callee}`).emit('callConnected', { callId });
    }
  } catch (error) {
    console.error('Error handling call connected:', error);
  }
};

// Save call to history
const saveCallToHistory = (call) => {
  try {
    const callRecord = {
      ...call,
      savedAt: new Date()
    };
    
    callHistory.set(call.callId, callRecord);
    
    // Log call for debugging
    console.log(`Call ${call.callId} saved to history:`, {
      caller: call.caller,
      callee: call.callee,
      type: call.type,
      status: call.status,
      duration: call.duration || 0,
      startTime: call.startTime,
      endTime: call.endTime
    });
    
    // In a production environment, you might want to save to a database
    // await CallHistory.create(callRecord);
    
  } catch (error) {
    console.error('Error saving call to history:', error);
  }
};

// Clean up old calls and call history
const cleanupOldCalls = () => {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  // Clean up active calls that are stuck
  for (const [callId, call] of activeCalls.entries()) {
    const age = now - call.startTime;
    
    if (age > maxAge) {
      console.log(`Cleaning up stuck call ${callId} (age: ${Math.floor(age / 1000)}s)`);
      
      // Save to history before cleanup
      call.status = 'abandoned';
      call.endTime = now;
      saveCallToHistory(call);
      
      activeCalls.delete(callId);
    }
  }
  
  // Clean up old call history
  for (const [callId, record] of callHistory.entries()) {
    const age = now - record.savedAt;
    
    if (age > maxAge) {
      callHistory.delete(callId);
    }
  }
  
  console.log(`Cleanup completed. Active calls: ${activeCalls.size}, History records: ${callHistory.size}`);
};

// Start cleanup interval
const startCleanupInterval = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  // Run cleanup every hour
  cleanupInterval = setInterval(cleanupOldCalls, 60 * 60 * 1000);
  console.log('Call cleanup interval started');
};

// Stop cleanup interval
const stopCleanupInterval = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('Call cleanup interval stopped');
  }
};

// Get call statistics
const getCallStatistics = () => {
  const stats = {
    activeCalls: activeCalls.size,
    historyRecords: callHistory.size,
    callsByStatus: {},
    callsByType: {}
  };
  
  // Analyze active calls
  for (const call of activeCalls.values()) {
    stats.callsByStatus[call.status] = (stats.callsByStatus[call.status] || 0) + 1;
    stats.callsByType[call.type] = (stats.callsByType[call.type] || 0) + 1;
  }
  
  return stats;
};

// Handle user disconnect
const handleDisconnect = async (socket, io) => {
  const userId = socket.userId;
  
  if (!userId) return;

  console.log(`User ${userId} disconnected`);

  // End any active calls for this user
  for (const [callId, call] of activeCalls.entries()) {
    if (call.caller === userId || call.callee === userId) {
      const otherUserId = call.caller === userId ? call.callee : call.caller;
      
      // Update call record
      call.status = 'disconnected';
      call.endTime = new Date();
      call.endedBy = userId;
      call.endReason = 'User disconnected';
      
      if (call.connectedTime) {
        call.duration = Math.floor((call.endTime - call.connectedTime) / 1000);
      }
      
      // Notify other user
      io.to(`user_${otherUserId}`).emit('callEnded', { 
        callId, 
        reason: 'User disconnected',
        duration: call.duration || 0
      });
      
      // Save to history
      saveCallToHistory(call);
      
      // Clean up
      activeCalls.delete(callId);
    }
  }

  // Remove from online users
  onlineUsers.delete(userId);

  // Update user offline status in database
  await User.setUserOffline(userId);

  // Clean up typing indicators
  for (const [conversationId, typingSet] of typingUsers.entries()) {
    if (typingSet.has(userId)) {
      typingSet.delete(userId);
      
      // Broadcast stop typing
      io.to(`conversation_${conversationId}`).emit('userTyping', {
        conversationId,
        userId,
        isTyping: false
      });
      
      // Clean up empty sets
      if (typingSet.size === 0) {
        typingUsers.delete(conversationId);
      }
    }
  }

  // Broadcast user offline status
  broadcastUserStatus(userId, false, io);
};

// Broadcast user online/offline status to relevant users
const broadcastUserStatus = async (userId, isOnline, io) => {
  try {
    // Get user's conversations to find who should be notified
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', '_id');

    const notifyUsers = new Set();
    
    conversations.forEach(conv => {
      conv.participants.forEach(participant => {
        if (participant._id.toString() !== userId) {
          notifyUsers.add(participant._id.toString());
        }
      });
    });

    // Broadcast status to relevant users
    notifyUsers.forEach(targetUserId => {
      io.to(`user_${targetUserId}`).emit('userStatusChanged', {
        userId,
        isOnline,
        timestamp: new Date()
      });
    });
  } catch (error) {
    console.error('Error broadcasting user status:', error);
  }
};

// Get online users (for debugging/admin purposes)
const getOnlineUsers = () => {
  return Array.from(onlineUsers.values());
};

// Get typing users (for debugging purposes)
const getTypingUsers = () => {
  const result = {};
  for (const [conversationId, userSet] of typingUsers.entries()) {
    result[conversationId] = Array.from(userSet);
  }
  return result;
};

// Initialize cleanup interval when module is loaded
startCleanupInterval();

module.exports = {
  authenticateSocket,
  handleConnection,
  handleAddUser,
  handleSendMessage,
  handleJoinConversation,
  handleLeaveConversation,
  handleMarkAsRead,
  handleTyping,
  handleStopTyping,
  handleCallOffer,
  handleCallAnswer,
  handleCallReject,
  handleCallEnd,
  handleIceCandidate,
  handleMuteStatusChanged,
  handleVideoStatusChanged,
  handleCallConnected,
  handleDisconnect,
  getOnlineUsers,
  getTypingUsers,
  getCallStatistics,
  cleanupOldCalls,
  startCleanupInterval,
  stopCleanupInterval
};