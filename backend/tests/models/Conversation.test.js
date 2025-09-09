const mongoose = require('mongoose');
const Conversation = require('../../models/Conversation');
const User = require('../../models/User');

describe('Conversation Model', () => {
  let testUser1, testUser2, testUser3;

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

    testUser3 = new User({
      name: 'Test User 3',
      email: 'test3@example.com',
      password: 'password123',
      location: 'Test Location'
    });
    await testUser3.save();
  });

  afterAll(async () => {
    // Clean up test data
    await Conversation.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean conversations before each test
    await Conversation.deleteMany({});
  });

  describe('Conversation Creation', () => {
    test('should create a valid conversation', async () => {
      const conversation = new Conversation({
        participants: [testUser1._id, testUser2._id]
      });

      const savedConversation = await conversation.save();

      expect(savedConversation._id).toBeDefined();
      expect(savedConversation.participants).toHaveLength(2);
      expect(savedConversation.lastActivity).toBeDefined();
      expect(savedConversation.unreadCount).toBeDefined();
    });

    test('should fail validation without participants', async () => {
      const conversation = new Conversation({});

      await expect(conversation.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let testConversation;

    beforeEach(async () => {
      testConversation = new Conversation({
        participants: [testUser1._id, testUser2._id]
      });
      await testConversation.save();
    });

    test('should update last activity', async () => {
      const originalActivity = testConversation.lastActivity;
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await testConversation.updateLastActivity();
      expect(testConversation.lastActivity.getTime()).toBeGreaterThan(originalActivity.getTime());
    });

    test('should increment unread count', async () => {
      await testConversation.incrementUnreadCount(testUser1._id);
      expect(testConversation.getUnreadCount(testUser1._id)).toBe(1);
      
      await testConversation.incrementUnreadCount(testUser1._id);
      expect(testConversation.getUnreadCount(testUser1._id)).toBe(2);
    });

    test('should reset unread count', async () => {
      await testConversation.incrementUnreadCount(testUser1._id);
      expect(testConversation.getUnreadCount(testUser1._id)).toBe(1);
      
      await testConversation.resetUnreadCount(testUser1._id);
      expect(testConversation.getUnreadCount(testUser1._id)).toBe(0);
    });
  });

  describe('Static Methods', () => {
    test('should find conversation by participants', async () => {
      const conversation = new Conversation({
        participants: [testUser1._id, testUser2._id]
      });
      await conversation.save();

      const foundConversation = await Conversation.findByParticipants(testUser1._id, testUser2._id);
      expect(foundConversation).toBeTruthy();
      expect(foundConversation._id.toString()).toBe(conversation._id.toString());
    });

    test('should find user conversations', async () => {
      // Create conversations
      const conv1 = new Conversation({
        participants: [testUser1._id, testUser2._id]
      });
      await conv1.save();

      const conv2 = new Conversation({
        participants: [testUser1._id, testUser3._id]
      });
      await conv2.save();

      const userConversations = await Conversation.findUserConversations(testUser1._id);
      expect(userConversations).toHaveLength(2);
    });

    test('should create new conversation if none exists', async () => {
      const conversation = await Conversation.createConversation(testUser1._id, testUser2._id);
      
      expect(conversation).toBeTruthy();
      expect(conversation.participants).toContain(testUser1._id);
      expect(conversation.participants).toContain(testUser2._id);
    });

    test('should return existing conversation if already exists', async () => {
      // Create initial conversation
      const initialConv = await Conversation.createConversation(testUser1._id, testUser2._id);
      
      // Try to create again
      const duplicateConv = await Conversation.createConversation(testUser1._id, testUser2._id);
      
      expect(initialConv._id.toString()).toBe(duplicateConv._id.toString());
    });
  });
});