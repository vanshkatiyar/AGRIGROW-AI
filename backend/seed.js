const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, './.env') });

const mongoose = require('mongoose');
const User = require('./models/User');

const seedExperts = [
  {
    name: 'Dr. Alice Green',
    email: 'alice.green@example.com',
    password: 'password123',
    location: 'California, USA',
    role: 'expert',
    profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
    expertDetails: {
      specializations: ['Soil Science', 'Crop Rotation'],
      hourlyRate: 150,
      ratings: [],
    },
  },
  {
    name: 'Dr. Bob White',
    email: 'bob.white@example.com',
    password: 'password123',
    location: 'Texas, USA',
    role: 'expert',
    profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
    expertDetails: {
      specializations: ['Pest Control', 'Irrigation'],
      hourlyRate: 120,
      ratings: [],
    },
  },
];

const seedDB = async () => {
  await User.deleteMany({ role: 'expert' });
  await User.insertMany(seedExperts);
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected...');
    seedDB().then(() => {
      console.log('Database seeded successfully!');
      mongoose.connection.close();
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    mongoose.connection.close();
  });