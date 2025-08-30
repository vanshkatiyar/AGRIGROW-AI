const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cropName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        enum: ['kg', 'quintal', 'tonne'],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    qualityGrade: {
        type: String,
        enum: ['A', 'B', 'C'],
        required: true,
    },
    harvestDate: {
        type: Date,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true, // Making image required for listings
    },
    location: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;