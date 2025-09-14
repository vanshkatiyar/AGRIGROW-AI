const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   GET /api/user
// @desc    Get users, optionally filtered by role (e.g., for finding experts)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { role } = req.query; // Example: /api/user?role=expert
        const filter = role ? { role } : {};

        // Find users based on the filter and exclude their password from the result
        const users = await User.find(filter).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server Error while fetching users' });
    }
});

// @route   PUT /api/users/:id/role
// @desc    Update a user's role
// @access  Private (User can update their own role)
router.put('/:id/role', protect, async (req, res) => {
    const { role } = req.body;
    const userId = req.params.id;

    // Ensure the role is one of the allowed roles
    if (!['farmer', 'buyer', 'expert', 'serviceProvider'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    try {
        // Ensure the logged-in user is updating their own role
        if (req.user.id !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this user\'s role' });
        }

        const user = await User.findById(userId);
        if (user) {
            user.role = role;
            const updatedUser = await user.save();
            res.json({
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                location: updatedUser.location,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Server error while updating role' });
    }
});

// @route   PUT /api/user/profile
// @desc    Update the logged-in user's profile information (name, bio, images)
// @access  Private
router.put('/profile', protect, upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, bio, gender } = req.body;

        // Handle profile image upload to Cloudinary
        if (req.files && req.files.profileImage) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: "agrigrow_profiles" }, (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                });
                stream.end(req.files.profileImage[0].buffer);
            });
            user.profileImage = result.secure_url;
        }

        // Handle cover photo upload to Cloudinary
        if (req.files && req.files.coverPhoto) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: "agrigrow_covers" }, (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                });
                stream.end(req.files.coverPhoto[0].buffer);
            });
            user.coverPhoto = result.secure_url;
        }

        // Update text fields
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

// @route   GET /api/user/:id
// @desc    Get a user's public profile by their ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        // Find user by ID and exclude the password field
        const userProfile = await User.findById(req.params.id).select('-password');

        if (userProfile) {
            res.json(userProfile);
        } else {
            res.status(404).json({ message: 'User profile not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        // Handle cases where the provided ID is not a valid MongoDB ObjectId
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'User profile not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- TEMPORARY ROUTE FOR ROLE FIX ---
// @route   PUT /api/users/set-expert
// @desc    Set the current user's role to expert
// @access  Private
router.put('/set-expert', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.role = 'expert';
        // --- FIX: Add default expert details to satisfy the schema ---
        user.expertDetails = {
            specializations: ['Crop Management'], // Default value
            experienceYears: 5, // Default value
        };
        await user.save();
        res.json({ message: 'User role updated to expert successfully.', user });
    } catch (error) {
        console.error('Error setting expert role:', error);
        res.status(500).json({ message: 'Server error while updating role.' });
    }
});

module.exports = router;