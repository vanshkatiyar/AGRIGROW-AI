const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: { type: String, required: true },
    areaInAcres: { type: Number, required: true },
    plantingDate: { type: Date, required: true },
    expectedYield: { type: String, required: true },
    estimatedRevenue: { type: Number, required: true },
    // --- NEW: Status field to track crop lifecycle ---
    status: {
        type: String,
        enum: ['active', 'harvested'],
        default: 'active',
    },
    harvestDate: { type: Date }, // Will be set when harvested
}, { timestamps: true });

const Crop = mongoose.model('Crop', cropSchema);
module.exports = Crop;