const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }],
  lastMessage: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  lastActivity: { 
    type: Date, 
    default: Date.now 
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, { 
  timestamps: true
});

// Indexes for optimal query performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastActivity: -1 });

// Instance methods
conversationSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

conversationSchema.methods.incrementUnreadCount = function(userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  return this.save();
};

conversationSchema.methods.resetUnreadCount = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

conversationSchema.methods.getUnreadCount = function(userId) {
  return this.unreadCount.get(userId.toString()) || 0;
};

// Static methods
conversationSchema.statics.findByParticipants = function(participant1, participant2) {
  return this.findOne({
    participants: { 
      $all: [participant1, participant2],
      $size: 2
    }
  });
};

conversationSchema.statics.findUserConversations = function(userId, page = 1, limit = 20) {
  return this.find({ 
    participants: userId 
  })
  .populate('participants', 'name profileImage isOnline lastSeen')
  .populate('lastMessage')
  .sort({ lastActivity: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

conversationSchema.statics.createConversation = async function(participant1, participant2) {
  // Check if conversation already exists
  const existingConversation = await this.findByParticipants(participant1, participant2);
  if (existingConversation) {
    return existingConversation;
  }

  // Create new conversation
  const conversation = new this({
    participants: [participant1, participant2],
    unreadCount: new Map([
      [participant1.toString(), 0],
      [participant2.toString(), 0]
    ])
  });

  return conversation.save();
};

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;