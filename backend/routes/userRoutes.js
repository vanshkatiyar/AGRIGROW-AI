const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   PUT /api/user/role - (No changes)
router.put('/role', protect, async (req, res) => { /* ... existing code ... */ });

// @route   GET /api/user/:id - (No changes)
router.get('/:id', protect, async (req, res) => { /* ... existing code ... */ });

// --- NEW: Update User Profile ---
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', protect, 
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'coverPhoto', maxCount: 1 }
    ]), 
    async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Handle image uploads
        if (req.files.profileImage) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "smartfarm_profiles" }, (err, res) => err ? reject(err) : resolve(res));
                uploadStream.end(req.files.profileImage[0].buffer);
            });
            user.profileImage = result.secure_url;
        }
        if (req.files.coverPhoto) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "smartfarm_covers" }, (err, res) => err ? reject(err) : resolve(res));
                uploadStream.end(req.files.coverPhoto[0].buffer);
            });
            user.coverPhoto = result.secure_url;
        }

        // Update text fields
        user.name = req.body.name || user.name;
        user.bio = req.body.bio || user.bio;
        user.gender = req.body.gender || user.gender;
        user.role = req.body.role || user.role;

        const updatedUser = await user.save();
        res.json(updatedUser.toObject()); // Send back the full updated user

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
});

module.exports = router;