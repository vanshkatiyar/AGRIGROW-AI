const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    serviceType: {
        type: String,
        enum: ['tractor', 'harvester', 'supplier', 'manufacturer'],
        required: true,
    },
    businessName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        address: { type: String, required: true },
        coordinates: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true }
        }
    },
    contactInfo: {
        phone: { type: String, required: true },
        email: { type: String },
        whatsapp: { type: String }
    },
    
    // For tractor/harvester owners
    equipment: [{
        name: { type: String },
        model: { type: String },
        year: { type: Number },
        hourlyRate: { type: Number },
        dailyRate: { type: Number },
        availability: { type: Boolean, default: true },
        images: [{ type: String }]
    }],
    
    // For suppliers/manufacturers
    products: [{
        name: { type: String },
        category: { type: String }, // seeds, fertilizers, pesticides, tools, etc.
        price: { type: Number },
        unit: { type: String },
        description: { type: String },
        images: [{ type: String }],
        inStock: { type: Boolean, default: true }
    }],
    
    serviceArea: {
        radius: { type: Number, default: 50 }, // in kilometers
        districts: [{ type: String }]
    },
    
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    
    businessHours: {
        monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
    }
}, { timestamps: true });

// Index for geospatial queries
serviceProviderSchema.index({ "location.coordinates": "2dsphere" });

// Static method to find nearby service providers
serviceProviderSchema.statics.findNearby = function(latitude, longitude, serviceType, maxDistance = 50000) {
    return this.find({
        serviceType: serviceType,
        isActive: true,
        "location.coordinates": {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance // in meters
            }
        }
    }).populate('owner', 'name profileImage');
};

const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema);
module.exports = ServiceProvider;