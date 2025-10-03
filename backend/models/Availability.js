const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    expert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Availability = mongoose.model('Availability', availabilitySchema);
module.exports = Availability;