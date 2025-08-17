const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate a token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    // This route is working correctly.
    const { name, email, password, location } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = await User.create({ name, email, password, location });

        if (user) {
            res.status(201).json({
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    location: user.location,
                    role: user.role,
                },
            });
        }
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server Error during registration' });
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        // --- THIS IS THE FIX ---
        // Changed `of` to `=` for correct object destructuring
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    location: user.location,
                    role: user.role,
                },
            });
        } else {
            // This is the error for wrong credentials, which you weren't seeing before
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server Error during login' });
    }
});

module.exports = router;