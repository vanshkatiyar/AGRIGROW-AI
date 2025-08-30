const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const Product = require('../models/Product');

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   POST /api/products (Create a product)
router.post('/', protect, upload.single('image'), async (req, res) => {
    if (req.user.role !== 'farmer') {
        return res.status(403).json({ message: 'Forbidden: Only farmers can list products.' });
    }
    const { cropName, description, price, unit, quantity, qualityGrade, harvestDate } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'Product image is required.' });
    }
    try {
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: "smartfarm_products" }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });
        const newProduct = new Product({
            seller: req.user.id,
            location: req.user.location,
            imageUrl: uploadResult.secure_url,
            cropName, description, price, unit, quantity, qualityGrade, harvestDate,
        });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error while creating product' });
    }
});

// @route   GET /api/products (Get all products)
router.get('/', protect, async (req, res) => {
    try {
        const products = await Product.find({}).populate('seller', 'name profileImage').sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error while fetching products' });
    }
});

// @route   PUT /api/products/:id (Update a product)
router.put('/:id', protect, async (req, res) => {
    const { cropName, description, price, unit, quantity, qualityGrade, harvestDate } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.seller.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

        product.cropName = cropName || product.cropName;
        product.description = description || product.description;
        product.price = price || product.price;
        product.unit = unit || product.unit;
        product.quantity = quantity || product.quantity;
        product.qualityGrade = qualityGrade || product.qualityGrade;
        product.harvestDate = harvestDate || product.harvestDate;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error while updating product' });
    }
});

// @route   DELETE /api/products/:id (Delete a product)
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.seller.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        
        await product.deleteOne(); // Use deleteOne() which is the modern way
        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error while deleting product' });
    }
});

module.exports = router;