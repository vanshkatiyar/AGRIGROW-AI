const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const User = require('../models/User'); 
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/consultations
// @desc    Book a new consultation with an expert
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'farmer') {
        return res.status(403).json({ message: 'Only farmers can book consultations.' });
    }
    const { expertId, issue, cropType, urgency, consultationFee } = req.body;
    if (!expertId || !issue || !cropType) {
        return res.status(400).json({ message: 'Expert, issue, and crop type are required.' });
    }
    try {
        const consultation = new Consultation({ farmer: req.user._id, expert: expertId, issue, cropType, urgency, consultationFee });
        await consultation.save();
        res.status(201).json({ message: 'Consultation booked successfully!', consultation });
    } catch (error) {
        console.error('Error booking consultation:', error);
        res.status(500).json({ message: 'Server error while booking consultation.' });
    }
});

// @route   GET /api/consultations/requests
// @desc    Get pending consultation requests for the logged-in expert
// @access  Private (Experts)
router.get('/requests', protect, async (req, res) => {
    if (req.user.role !== 'expert') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    try {
        console.log(`[Backend] Fetching requests for expert ID: ${req.user._id}`);
        const requests = await Consultation.find({ 
            expert: req.user._id, 
            status: 'pending' 
        })
        .populate({
            path: 'farmer',
            select: 'name profileImage location',
            model: 'User' // Explicitly specify the model
        })
        .sort({ createdAt: -1 });

        // Filter out any consultations where the farmer might have been deleted
        const validRequests = requests.filter(req => req.farmer);

        console.log(`[Backend] Found ${validRequests.length} valid pending requests.`);
        res.json(validRequests); // Always send a response

    } catch (error) {
        console.error('Error fetching consultation requests:', error);
        res.status(500).json({ message: 'Server error while fetching requests.' });
    }
});


// @route   PUT /api/consultations/:id/status
// @desc    Update the status of a consultation
router.put('/:id/status', protect, async (req, res) => {
    if (req.user.role !== 'expert') { return res.status(403).json({ message: 'Access denied.' }); }
    try {
        const { status } = req.body;
        const consultation = await Consultation.findById(req.params.id);
        if (!consultation) { return res.status(404).json({ message: 'Consultation not found.' }); }
        if (consultation.expert.toString() !== req.user._id.toString()) { return res.status(401).json({ message: 'Not authorized.' }); }
        consultation.status = status;
        await consultation.save();
        res.json(consultation);
    } catch (error) {
        console.error('Error updating consultation status:', error);
        res.status(500).json({ message: 'Server error while updating status.' });
    }
});

// @route   GET /api/consultations/history
// @desc    Get consultation history for the logged-in user
router.get('/history', protect, async (req, res) => {
    try {
        const query = { status: { $ne: 'pending' } };
        if (req.user.role === 'farmer') { query.farmer = req.user._id; } 
        else if (req.user.role === 'expert') { query.expert = req.user._id; } 
        else { return res.status(403).json({ message: 'User role not authorized.' }); }
        
        const consultations = await Consultation.find(query)
            .populate('farmer', 'name profileImage')
            .populate('expert', 'name profileImage')
            .sort({ updatedAt: -1 });
        res.json(consultations);
    } catch (error) {
        console.error('Error fetching consultation history:', error);
        res.status(500).json({ message: 'Server error while fetching history.' });
    }
});

module.exports = router;