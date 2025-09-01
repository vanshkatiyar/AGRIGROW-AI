const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Crop = require('../models/Crop');

// @route   POST /api/crops
// @desc    Add a new crop
router.post('/', protect, async (req, res) => {
    try {
        const { name, areaInAcres, plantingDate, expectedYield, estimatedRevenue } = req.body;
        const newCrop = new Crop({
            user: req.user.id,
            name, areaInAcres, plantingDate, expectedYield, estimatedRevenue,
        });
        const savedCrop = await newCrop.save();
        res.status(201).json(savedCrop);
    } catch (error) {
        res.status(500).json({ message: 'Server error while adding crop' });
    }
});

// @route   GET /api/crops
// @desc    Get all crops for the logged-in farmer
router.get('/', protect, async (req, res) => {
    try {
        const crops = await Crop.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(crops);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching crops' });
    }
});

// @route   PUT /api/crops/:id/harvest
// @desc    Mark a crop as harvested
router.put('/:id/harvest', protect, async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) return res.status(404).json({ message: 'Crop not found' });
        if (crop.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

        crop.status = 'harvested';
        crop.harvestDate = new Date(); // Set the harvest date to now
        await crop.save();
        res.json(crop);
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating crop' });
    }
});

module.exports = router;