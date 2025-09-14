const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, location } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // --- CHANGE: More explicit user creation ---
        // Instead of User.create(), we create an instance and then save it.
        // This provides better control and error handling.
        const user = new User({
            name,
            email,
            password,
            location,
        });

        const createdUser = await user.save(); // The .save() method triggers the password hashing

        if (createdUser) {
            res.status(201).json({
                token: generateToken(createdUser._id, createdUser.role),
                user: {
                    id: createdUser._id,
                    name: createdUser.name,
                    email: createdUser.email,
                    location: createdUser.location,
                    role: createdUser.role,
                },
            });
        }
    } catch (error) {
        // --- CHANGE: Enhanced Error Logging ---
        console.error('--- REGISTRATION ERROR ---');
        console.error('Error Message:', error.message);
        if (error.errors) {
            // This will show specific Mongoose validation errors
            console.error('Validation Errors:', error.errors);
        }
        console.error('--------------------------');
        res.status(500).json({ message: 'Server Error during registration' });
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                token: generateToken(user._id, user.role),
                user: { id: user._id, name: user.name, email: user.email, location: user.location, role: user.role },
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error during login' });
    }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    res.json({
        user: { id: req.user._id, name: req.user.name, email: req.user.email, location: req.user.location, role: req.user.role }
    });
});

module.exports = router;