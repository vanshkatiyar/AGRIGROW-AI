const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   PUT /api/user/role
// @desc    Update user role after registration
// @access  Private
router.put('/role', protect, async (req, res) => {
    const { role } = req.body;

    // Basic validation
    if (!['farmer', 'buyer', 'expert'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.role = role;
            const updatedUser = await user.save();

            res.json({
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    location: updatedUser.location,
                    role: updatedUser.role,
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;