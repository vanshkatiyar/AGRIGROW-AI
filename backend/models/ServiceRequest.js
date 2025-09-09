const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    serviceProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceProvider',
        required: true,
    },
    serviceType: {
        type: String,
        enum: ['tractor', 'harvester', 'supplier', 'manufacturer'],
        required: true,
    },
    requestType: {
        type: String,
        enum: ['booking', 'inquiry', 'quote'],
        required: true,
    },
    
    // Service details
    serviceDetails: {
        equipmentId: { type: String }, // for tractor/harvester bookings
        productIds: [{ type: String }], // for supplier/manufacturer orders
        startDate: { type: Date },
        endDate: { type: Date },
        duration: { type: Number }, // in hours or days
        farmLocation: {
            address: { type: String, required: true },
            coordinates: {
                latitude: { type: Number },
                longitude: { type: Number }
            }
        },
        farmSize: { type: Number }, // in acres
        cropType: { type: String },
        specialRequirements: { type: String }
    },
    
    pricing: {
        quotedPrice: { type: Number },
        finalPrice: { type: Number },
        currency: { type: String, default: 'INR' },
        paymentTerms: { type: String }
    },
    
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    
    rating: {
        score: { type: Number, min: 1, max: 5 },
        review: { type: String },
        ratedAt: { type: Date }
    }
}, { timestamps: true });

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
module.exports = ServiceRequest;