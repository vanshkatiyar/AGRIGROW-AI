const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function testUsersAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all users first
    const allUsers = await User.find({}).select('name email _id');
    console.log(`\n📊 Total users in database: ${allUsers.length}`);

    if (allUsers.length === 0) {
      console.log('❌ No users found! Run createTestUsers.js first.');
      return;
    }

    // Test the findUsersForMessaging method with the first user
    const currentUser = allUsers[0];
    console.log(`\n🧪 Testing findUsersForMessaging for: ${currentUser.name} (${currentUser.email})`);

    const availableUsers = await User.findUsersForMessaging(currentUser._id, '', 1, 20);
    
    console.log(`\n✅ Found ${availableUsers.length} users available for messaging:`);
    availableUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role || 'No role'}`);
    });

    // Test with search term
    console.log(`\n🔍 Testing search with term 'Alice':`);
    const searchResults = await User.findUsersForMessaging(currentUser._id, 'Alice', 1, 20);
    console.log(`Found ${searchResults.length} users matching 'Alice':`);
    searchResults.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });

  } catch (error) {
    console.error('❌ Error testing users API:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testUsersAPI();