const mongoose = require('mongoose');
const {
  getConversations,
  getConversationMessages,
  createConversation,
  markMessageAsRead,
  markConversationAsRead,
  deleteMessage,
  searchMessages,
  getUsersForMessaging
} = require('../../controllers/messageController');
const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');
const User = require('../../models/User');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Message Controller', () => {
  let testUser1, testUser2, testConversation, testMessage;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/agrigrow_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    await User.deleteMany({});

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
    testConversation = await Conversation.createConversation(testUser1._id, testUser2._id);

    // Create test message
    testMessage = new Message({
      senderId: testUser1._id,
      recipientId: testUser2._id,
      conversationId: testConversation._id,
      content: 'Test message'
    });
    await testMessage.save();
  });

  describe('getConversations', () => {
    test('should get user conversations successfully', async () => {
      const req = { user: { _id: testUser1._id }, query: {} };
      const res = mockResponse();

      await getConversations(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          conversations: expect.any(Array),
          pagination: expect.any(Object)
        })
      );
    });

    test('should handle pagination parameters', async () => {
      const req = { 
        user: { _id: testUser1._id }, 
        query: { page: '2', limit: '10' } 
      };
      const res = mockResponse();

      await getConversations(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            page: 2,
            limit: 10
          })
        })
      );
    });
  });

  describe('getConversationMessages', () => {
    test('should get conversation messages successfully', async () => {
      const req = { 
        user: { _id: testUser1._id },
        params: { conversationId: testConversation._id },
        query: {}
      };
      const res = mockResponse();

      await getConversationMessages(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.any(Array),
          pagination: expect.any(Object)
        })
      );
    });

    test('should return 404 for non-existent conversation', async () => {
      const req = { 
        user: { _id: testUser1._id },
        params: { conversationId: new mongoose.Types.ObjectId() },
        query: {}
      };
      const res = mockResponse();

      await getConversationMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
    });

    test('should return 403 for unauthorized access', async () => {
      const unauthorizedUser = new User({
        name: 'Unauthorized User',
        email: 'unauthorized@example.com',
        password: 'password123',
        location: 'Test Location'
      });
      await unauthorizedUser.save();

      const req = { 
        user: { _id: unauthorizedUser._id },
        params: { conversationId: testConversation._id },
        query: {}
      };
      const res = mockResponse();

      await getConversationMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied to this conversation' });
    });
  });

  describe('createConversation', () => {
    test('should create conversation successfully', async () => {
      const newUser = new User({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        location: 'Test Location'
      });
      await newUser.save();

      const req = { 
        user: { _id: testUser1._id },
        body: { recipientId: newUser._id }
      };
      const res = mockResponse();

      await createConversation(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    test('should return existing conversation if already exists', async () => {
      const req = { 
        user: { _id: testUser1._id },
        body: { recipientId: testUser2._id }
      };
      const res = mockResponse();

      await createConversation(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: testConversation._id
        })
      );
    });

    test('should return 404 for non-existent recipient', async () => {
      const req = { 
        user: { _id: testUser1._id },
        body: { recipientId: new mongoose.Types.ObjectId() }
      };
      const res = mockResponse();

      await createConversation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recipient not found' });
    });
  });

  describe('markMessageAsRead', () => {
    test('should mark message as read successfully', async () => {
      const req = { 
        user: { _id: testUser2._id },
        params: { messageId: testMessage._id }
      };
      const res = mockResponse();

      await markMessageAsRead(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Message marked as read' });

      // Verify message is marked as read
      const updatedMessage = await Message.findById(testMessage._id);
      expect(updatedMessage.isRead).toBe(true);
    });

    test('should return 403 if user is not recipient', async () => {
      const req = { 
        user: { _id: testUser1._id },
        params: { messageId: testMessage._id }
      };
      const res = mockResponse();

      await markMessageAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied' });
    });
  });

  describe('deleteMessage', () => {
    test('should delete message successfully', async () => {
      const req = { 
        user: { _id: testUser1._id },
        params: { messageId: testMessage._id }
      };
      const res = mockResponse();

      await deleteMessage(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Message deleted successfully' });

      // Verify message is soft deleted
      const deletedMessage = await Message.findById(testMessage._id);
      expect(deletedMessage.deletedAt).toBeDefined();
    });

    test('should return 403 if user is not sender', async () => {
      const req = { 
        user: { _id: testUser2._id },
        params: { messageId: testMessage._id }
      };
      const res = mockResponse();

      await deleteMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied' });
    });
  });

  describe('searchMessages', () => {
    beforeEach(async () => {
      // Create additional messages for search
      const searchMessage = new Message({
        senderId: testUser2._id,
        recipientId: testUser1._id,
        conversationId: testConversation._id,
        content: 'This is a searchable message'
      });
      await searchMessage.save();
    });

    test('should search messages successfully', async () => {
      const req = { 
        user: { _id: testUser1._id },
        query: { query: 'searchable' }
      };
      const res = mockResponse();

      await searchMessages(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.any(Array),
          query: 'searchable',
          pagination: expect.any(Object)
        })
      );
    });

    test('should return 400 for short search query', async () => {
      const req = { 
        user: { _id: testUser1._id },
        query: { query: 'a' }
      };
      const res = mockResponse();

      await searchMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Search query must be at least 2 characters' 
      });
    });
  });

  describe('getUsersForMessaging', () => {
    beforeEach(async () => {
      // Create additional users
      const user3 = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        location: 'Test Location'
      });
      await user3.save();
    });

    test('should get users for messaging successfully', async () => {
      const req = { 
        user: { _id: testUser1._id },
        query: {}
      };
      const res = mockResponse();

      await getUsersForMessaging(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          users: expect.any(Array),
          pagination: expect.any(Object)
        })
      );
    });

    test('should search users by name', async () => {
      const req = { 
        user: { _id: testUser1._id },
        query: { search: 'John' }
      };
      const res = mockResponse();

      await getUsersForMessaging(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          users: expect.any(Array),
          pagination: expect.any(Object)
        })
      );
    });
  });
});