const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model - Messaging Features', () => {
  let testUser1, testUser2;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/agrigrow_test');
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean users before each test
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
  });

  describe('Messaging Fields', () => {
    test('should have default messaging preferences', () => {
      expect(testUser1.messagingPreferences.allowMessagesFrom).toBe('everyone');
      expect(testUser1.messagingPreferences.emailNotifications).toBe(true);
      expect(testUser1.isOnline).toBe(false);
      expect(testUser1.lastSeen).toBeDefined();
    });
  });

  describe('Online Status Methods', () => {
    test('should set user online', async () => {
      await testUser1.setOnline();
      expect(testUser1.isOnline).toBe(true);
      expect(testUser1.lastSeen).toBeDefined();
    });

    test('should set user offline', async () => {
      await testUser1.setOnline();
      expect(testUser1.isOnline).toBe(true);
      
      await testUser1.setOffline();
      expect(testUser1.isOnline).toBe(false);
    });
  });

  describe('Message Permission Methods', () => {
    test('should allow messages from everyone by default', () => {
      const canReceive = testUser1.canReceiveMessagesFrom(testUser2._id);
      expect(canReceive).toBe(true);
    });

    test('should block messages when set to none', async () => {
      testUser1.messagingPreferences.allowMessagesFrom = 'none';
      await testUser1.save();
      
      const canReceive = testUser1.canReceiveMessagesFrom(testUser2._id);
      expect(canReceive).toBe(false);
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create additional test users
      const user3 = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        location: 'Test Location',
        messagingPreferences: {
          allowMessagesFrom: 'none'
        }
      });
      await user3.save();

      const user4 = new User({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        location: 'Test Location'
      });
      await user4.save();
    });

    test('should find users for messaging', async () => {
      const users = await User.findUsersForMessaging(testUser1._id);
      
      // Should exclude current user and users who don't allow messages
      expect(users.length).toBeGreaterThan(0);
      expect(users.find(u => u._id.toString() === testUser1._id.toString())).toBeUndefined();
    });

    test('should search users by name', async () => {
      const users = await User.findUsersForMessaging(testUser1._id, 'John');
      
      expect(users.length).toBeGreaterThan(0);
      expect(users[0].name).toContain('John');
    });

    test('should set user online via static method', async () => {
      const updatedUser = await User.setUserOnline(testUser1._id);
      
      expect(updatedUser.isOnline).toBe(true);
      expect(updatedUser.lastSeen).toBeDefined();
    });

    test('should set user offline via static method', async () => {
      await User.setUserOnline(testUser1._id);
      const updatedUser = await User.setUserOffline(testUser1._id);
      
      expect(updatedUser.isOnline).toBe(false);
    });
  });
});