const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testUsers = [
  {
    name: 'Alice Farmer',
    email: 'alice@example.com',
    password: 'password123',
    location: 'Punjab, India',
    role: 'farmer'
  },
  {
    name: 'Bob Buyer',
    email: 'bob@example.com',
    password: 'password123',
    location: 'Delhi, India',
    role: 'buyer'
  },
  {
    name: 'Dr. Carol Expert',
    email: 'carol@example.com',
    password: 'password123',
    location: 'Mumbai, India',
    role: 'expert'
  },
  {
    name: 'David Farmer',
    email: 'david@example.com',
    password: 'password123',
    location: 'Gujarat, India',
    role: 'farmer'
  },
  {
    name: 'Emma Buyer',
    email: 'emma@example.com',
    password: 'password123',
    location: 'Bangalore, India',
    role: 'buyer'
  }
];

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if users already exist
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create new user
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }

    console.log('\n🎉 Test users creation completed!');
    console.log('\nYou can now login with any of these accounts:');
    testUsers.forEach(user => {
      console.log(`- ${user.email} / password123 (${user.role})`);
    });

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
createTestUsers();