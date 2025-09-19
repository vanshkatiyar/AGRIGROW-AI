const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { type: String, enum: ['tractor', 'harvester', 'supplier', 'manufacturer'], required: true },
  businessName: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String },
    whatsapp: { type: String },
  },
  equipment: [{
    name: { type: String },
    model: { type: String },
    year: { type: Number },
    hourlyRate: { type: Number },
    dailyRate: { type: Number },
    availability: { type: Boolean },
    images: [{ type: String }],
  }],
  products: [{
    name: { type: String },
    category: { type: String },
    price: { type: Number },
    unit: { type: String },
    description: { type: String },
    images: [{ type: String }],
    inStock: { type: Boolean },
  }],
  serviceArea: {
    radius: { type: Number },
    districts: [{ type: String }],
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  businessHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean },
  },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);