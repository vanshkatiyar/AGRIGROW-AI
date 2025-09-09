const mongoose = require('mongoose');

// Setup for Jest tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Use test database
  if (!process.env.MONGO_TEST_URI) {
    process.env.MONGO_TEST_URI = 'mongodb://localhost:27017/agrigrow_test';
  }
});

afterAll(async () => {
  // Close database connection after all tests
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Global test timeout
jest.setTimeout(30000);