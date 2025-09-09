const mongoose = require('mongoose');
const Message = require('../../models/Message');
const User = require('../../models/User');
const Conversation = require('../../models/Conversation');

describe('Message Model', () => {
  let testUser1, testUser2, testConversation;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/agrigrow_test');
    
    // Create test users
    testUser1 = new User({
      name: 'Test User 1',
      email: 'test1@example.com',
      password: 'password123',
      location: 'Test Location'
    });
    await testUser1.save();

    testUser2 = new User({
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123',
      location: 'Test Location'
    });
    await testUser2.save();

    // Create test conversation
    testConversation = new Conversation({
      participants: [testUser1._id, testUser2._id]
    });
    await testConversation.save();
  });

  afterAll(async () => {
    // Clean up test data
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean messages before each test
    await Message.deleteMany({});
  });

  describe('Message Creation', () => {
    test('should create a valid message', async () => {
      const messageData = {
        senderId: testUser1._id,
        recipientId: testUser2._id,
        conversationId: testConversation._id,
        content: 'Test message content'
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage._id).toBeDefined();
      expect(savedMessage.content).toBe('Test message content');
      expect(savedMessage.messageType).toBe('text');
      expect(savedMessage.isRead).toBe(false);
      expect(savedMessage.isDelivered).toBe(false);
    });

    test('should fail validation without required fields', async () => {
      const message = new Message({
        content: 'Test message'
      });

      await expect(message.save()).rejects.toThrow();
    });

    test('should enforce content max length', async () => {
      const longContent = 'a'.repeat(1001);
      const message = new Message({
        senderId: testUser1._id,
        recipientId: testUser2._id,
        conversationId: testConversation._id,
        content: longContent
      });

      await expect(message.save()).rejects.toThrow();
    });
  });

  describe('Message Methods', () => {
    let testMessage;

    beforeEach(async () => {
      testMessage = new Message({
        senderId: testUser1._id,
        recipientId: testUser2._id,
        conversationId: testConversation._id,
        content: 'Test message'
      });
      await testMessage.save();
    });

    test('should mark message as read', async () => {
      await testMessage.markAsRead();
      expect(testMessage.isRead).toBe(true);
    });

    test('should mark message as delivered', async () => {
      await testMessage.markAsDelivered();
      expect(testMessage.isDelivered).toBe(true);
    });

    test('should soft delete message', async () => {
      await testMessage.softDelete();
      expect(testMessage.deletedAt).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test messages
      const messages = [
        {
          senderId: testUser1._id,
          recipientId: testUser2._id,
          conversationId: testConversation._id,
          content: 'Message 1'
        },
        {
          senderId: testUser2._id,
          recipientId: testUser1._id,
          conversationId: testConversation._id,
          content: 'Message 2'
        }
      ];

      await Message.insertMany(messages);
    });

    test('should find messages by conversation', async () => {
      const messages = await Message.findByConversation(testConversation._id);
      expect(messages).toHaveLength(2);
      expect(messages[0].senderId).toBeDefined();
    });

    test('should mark conversation messages as read', async () => {
      await Message.markConversationAsRead(testConversation._id, testUser1._id);
      
      const unreadMessages = await Message.find({
        conversationId: testConversation._id,
        recipientId: testUser1._id,
        isRead: false
      });
      
      expect(unreadMessages).toHaveLength(0);
    });
  });
});