const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function fetchUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Fetch all users
    const users = await User.find({})
      .select('name email role location isOnline lastSeen messagingPreferences createdAt')
      .sort({ createdAt: -1 });

    console.log(`\n📊 Found ${users.length} users in database:\n`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 You can create test users by running: node scripts/createTestUsers.js');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Role: ${user.role || 'No role set'}`);
        console.log(`   📍 Location: ${user.location}`);
        console.log(`   🟢 Online: ${user.isOnline ? 'Yes' : 'No'}`);
        console.log(`   💬 Can receive messages: ${user.messagingPreferences?.allowMessagesFrom || 'everyone'}`);
        console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
        console.log(`   🆔 ID: ${user._id}`);
        console.log('');
      });
    }

    // Also check messaging preferences
    const usersWithMessagingDisabled = await User.find({
      'messagingPreferences.allowMessagesFrom': 'none'
    }).select('name email');

    if (usersWithMessagingDisabled.length > 0) {
      console.log('⚠️  Users with messaging disabled:');
      usersWithMessagingDisabled.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
fetchUsers();