const mongoose = require('mongoose');

const consultationTypeSchema = new mongoose.Schema({
    expert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration_minutes: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const ConsultationType = mongoose.model('ConsultationType', consultationTypeSchema);
module.exports = ConsultationType;