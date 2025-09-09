const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  conversationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Conversation', 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    maxLength: 1000
  },
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'file'], 
    default: 'text' 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  isDelivered: { 
    type: Boolean, 
    default: false 
  },
  editedAt: Date,
  deletedAt: Date
}, { 
  timestamps: true
});

// Indexes for optimal query performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, isRead: 1 });

// Instance methods
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

messageSchema.methods.markAsDelivered = function() {
  this.isDelivered = true;
  return this.save();
};

messageSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Static methods
messageSchema.statics.findByConversation = function(conversationId, page = 1, limit = 50) {
  return this.find({ 
    conversationId, 
    deletedAt: { $exists: false } 
  })
  .populate('senderId', 'name profileImage')
  .populate('recipientId', 'name profileImage')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

messageSchema.statics.markConversationAsRead = function(conversationId, userId) {
  return this.updateMany(
    { 
      conversationId, 
      recipientId: userId, 
      isRead: false 
    },
    { isRead: true }
  );
};

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;