const mongoose = require('mongoose');

const expertProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    specialties: {
        type: [String],
        required: true,
        default: []
    },
    bio: {
        type: String,
        default: ''
    },
    experienceYears: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
}, { timestamps: true });

const ExpertProfile = mongoose.model('ExpertProfile', expertProfileSchema);
module.exports = ExpertProfile;