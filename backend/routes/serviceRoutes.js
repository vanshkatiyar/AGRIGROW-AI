const express = require('express');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProvider');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
// --- FIX 1: Use destructuring to import the 'protect' function directly ---
const { protect } = require('../middleware/authMiddleware');

// Get nearby service providers
// --- FIX 2: Use the 'protect' function as the middleware ---
router.get('/nearby', protect, async (req, res) => {
    try {
        const { latitude, longitude, serviceType, radius = 50 } = req.query;
        
        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }
        
        const maxDistance = radius * 1000; // Convert km to meters
        
        let query = {
            isActive: true,
            "location.coordinates": {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: maxDistance
                }
            }
        };
        
        if (serviceType) {
            query.serviceType = serviceType;
        }
        
        const providers = await ServiceProvider.find(query)
            .populate('owner', 'name profileImage phone email')
            .limit(20);
        
        res.json(providers);
    } catch (error) {
        console.error('Error fetching nearby providers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get service providers by type
// --- FIX 3: Apply the same correction to all routes in this file ---
router.get('/type/:serviceType', protect, async (req, res) => {
    try {
        const { serviceType } = req.params;
        const { page = 1, limit = 10, location } = req.query;
        
        let query = { serviceType, isActive: true };
        
        if (location) {
            query['location.address'] = { $regex: location, $options: 'i' };
        }
        
        const providers = await ServiceProvider.find(query)
            .populate('owner', 'name profileImage')
            .sort({ 'ratings.average': -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await ServiceProvider.countDocuments(query);
        
        res.json({
            providers,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching providers by type:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single service provider details
router.get('/:id', protect, async (req, res) => {
    try {
        const provider = await ServiceProvider.findById(req.params.id)
            .populate('owner', 'name profileImage email location');
        
        if (!provider) {
            return res.status(404).json({ message: 'Service provider not found' });
        }
        
        res.json(provider);
    } catch (error) {
        console.error('Error fetching provider details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create service request
router.post('/request', protect, async (req, res) => {
    try {
        const farmerId = req.user.id;
        const {
            serviceProviderId,
            serviceType,
            requestType,
            serviceDetails,
            message
        } = req.body;
        
        // Verify service provider exists
        const provider = await ServiceProvider.findById(serviceProviderId);
        if (!provider) {
            return res.status(404).json({ message: 'Service provider not found' });
        }
        
        const serviceRequest = new ServiceRequest({
            farmer: farmerId,
            serviceProvider: serviceProviderId,
            serviceType,
            requestType,
            serviceDetails,
            messages: message ? [{
                sender: farmerId,
                message
            }] : []
        });
        
        await serviceRequest.save();
        
        // Populate the request for response
        await serviceRequest.populate([
            { path: 'farmer', select: 'name profileImage' },
            { path: 'serviceProvider', select: 'businessName owner', populate: { path: 'owner', select: 'name' } }
        ]);
        
        res.status(201).json(serviceRequest);
    } catch (error) {
        console.error('Error creating service request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get farmer's service requests
router.get('/requests/my', protect, async (req, res) => {
    try {
        const farmerId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;
        
        let query = { farmer: farmerId };
        if (status) {
            query.status = status;
        }
        
        const requests = await ServiceRequest.find(query)
            .populate('serviceProvider', 'businessName serviceType location contactInfo')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await ServiceRequest.countDocuments(query);
        
        res.json({
            requests,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching service requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Compare service providers
router.post('/compare', protect, async (req, res) => {
    try {
        const { providerIds } = req.body;
        
        if (!providerIds || providerIds.length < 2) {
            return res.status(400).json({ message: 'At least 2 provider IDs required for comparison' });
        }
        
        const providers = await ServiceProvider.find({
            _id: { $in: providerIds },
            isActive: true
        }).populate('owner', 'name profileImage');
        
        res.json(providers);
    } catch (error) {
        console.error('Error comparing providers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search service providers
router.get('/search', protect, async (req, res) => {
    try {
        const { q, serviceType, location, minRating = 0 } = req.query;
        
        let query = { isActive: true };
        
        if (serviceType) {
            query.serviceType = serviceType;
        }
        
        if (minRating > 0) {
            query['ratings.average'] = { $gte: parseFloat(minRating) };
        }
        
        if (q) {
            query.$or = [
                { businessName: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { 'equipment.name': { $regex: q, $options: 'i' } },
                { 'products.name': { $regex: q, $options: 'i' } }
            ];
        }
        
        if (location) {
            query['location.address'] = { $regex: location, $options: 'i' };
        }
        
        const providers = await ServiceProvider.find(query)
            .populate('owner', 'name profileImage')
            .sort({ 'ratings.average': -1 })
            .limit(20);
        
        res.json(providers);
    } catch (error) {
        console.error('Error searching providers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;