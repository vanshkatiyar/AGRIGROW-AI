const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For 1-on-1 chats
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },     // For group chats
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'voice', 'image'], default: 'text' },
  status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;