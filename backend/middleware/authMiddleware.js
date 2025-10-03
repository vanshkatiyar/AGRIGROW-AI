const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
                return res.status(401).json({ message: 'Not authorized, invalid token' });
            }

            // --- FIX: Attach the decoded token payload (id and role) to req.user ---
            // This is more efficient and avoids issues with stale user data.
            req.user = decoded;
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to access this route' });
        }
        next();
    };
};

const expert = (req, res, next) => {
    if (req.user && req.user.role === 'expert') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an expert' });
    }
};

module.exports = { protect, authorizeRoles, expert };