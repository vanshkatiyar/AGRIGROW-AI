const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issue: { type: String, required: true },
    cropType: { type: String, required: true },
    images: [{ type: String }], // Assuming URLs from Cloudinary
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'in-progress'],
        default: 'pending',
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
    },
    consultationFee: { type: Number, default: 500 },
    rating: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

const Consultation = mongoose.model('Consultation', consultationSchema);
module.exports = Consultation;