const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const { protect } = require('../middleware/authMiddleware');
const { REAL_CROP_DATA } = require('../utils/realCropData');

// POST /api/crops – create crop with auto-harvest date
router.post('/', protect, async (req, res) => {
  try {
    const { name, areaInAcres, plantingDate, expectedYield, estimatedRevenue } = req.body;
    const cropInfo = REAL_CROP_DATA[name];
    if (!cropInfo) {
      return res.status(400).json({ message: 'Crop not recognised by the system.' });
    }

    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + cropInfo.daysToHarvest);

    const newCrop = new Crop({
      user: req.user._id,
      name,
      areaInAcres,
      plantingDate,
      expectedYield,
      estimatedRevenue,
      harvestDate, // Automatically calculated
      status: 'active',
    });
    
    await newCrop.save();
    res.status(201).json(newCrop);
  } catch (err) {
    console.error('Error adding crop:', err.message);
    res.status(500).json({ message: 'Server error while adding crop' });
  }
});

// GET /api/crops – user crops
router.get('/', protect, async (req, res) => {
  try {
    const crops = await Crop.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching crops' });
  }
});

// PUT /api/crops/:id/harvest
router.put('/:id/harvest', protect, async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    if (crop.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });
    
    crop.status = 'harvested';
    // Optionally update the harvest date to the actual date it was marked harvested
    crop.harvestDate = new Date(); 
    
    await crop.save();
    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: 'Server error while harvesting crop' });
  }
});

module.exports = router;