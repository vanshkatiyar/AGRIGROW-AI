const User = require('../models/User');

// @desc    Get all experts
// @route   GET /api/experts
// @access  Public
const getAllExperts = async (req, res) => {
  try {
    const experts = await User.find({ role: 'expert' }).select('-password');
    res.json(experts);
  } catch (error) {
    console.error('Error fetching experts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllExperts,
};