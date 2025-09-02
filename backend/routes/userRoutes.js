const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   PUT /api/user/role
// @desc    Update the logged-in user's role
router.put('/role', protect, async (req, res) => {
    const { role } = req.body;
    if (!['farmer', 'buyer', 'expert'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
    }
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.role = role;
            const updatedUser = await user.save();
            res.json({ user: updatedUser });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating role' });
    }
});

// @route   PUT /api/user/profile
// @desc    Update the logged-in user's profile information
router.put('/profile', protect, upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, bio, gender } = req.body;

        if (req.files && req.files.profileImage) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: "smartfarm_profiles" }, (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                });
                stream.end(req.files.profileImage[0].buffer);
            });
            user.profileImage = result.secure_url;
        }

        if (req.files && req.files.coverPhoto) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: "smartfarm_covers" }, (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                });
                stream.end(req.files.coverPhoto[0].buffer);
            });
            user.coverPhoto = result.secure_url;
        }

        user.name = name || user.name;
        user.bio = bio !== undefined ? bio : user.bio;
        user.gender = gender || user.gender;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
});

// --- THIS IS THE MISSING ROUTE ---
// @route   GET /api/user/:id
// @desc    Get a user's public profile by their ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const userProfile = await User.findById(req.params.id).select('-password');

        if (userProfile) {
            res.json(userProfile);
        } else {
            res.status(404).json({ message: 'User profile not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;