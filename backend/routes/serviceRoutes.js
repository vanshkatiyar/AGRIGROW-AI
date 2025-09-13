const express = require('express');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProvider');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
// --- FIX 1: Use destructuring to import the 'protect' function directly ---
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

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

// Create or update a service provider profile
router.post(
    '/',
    protect,
    authorizeRoles('serviceProvider'),
    upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'equipmentImages', maxCount: 10 },
        { name: 'productImages', maxCount: 10 }
    ]),
    async (req, res) => {
        try {
            const {
                serviceType,
                businessName,
                description,
                address,
                latitude,
                longitude,
                phone,
                email,
                whatsapp,
                equipment,
                products,
                serviceArea,
                businessHours
            } = req.body;

            const owner = req.user.id;

            // Basic validation
            if (!serviceType || !businessName || !description || !address || !latitude || !longitude || !phone) {
                return res.status(400).json({ message: 'Please fill all required fields.' });
            }

            const location = {
                address,
                coordinates: {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude)
                }
            };

            const contactInfo = { phone, email, whatsapp };

            let parsedEquipment = equipment ? JSON.parse(equipment) : [];
            if (req.files && req.files.equipmentImages) {
                // Logic to associate uploaded images with equipment items
            }

            let parsedProducts = products ? JSON.parse(products) : [];
            if (req.files && req.files.productImages) {
                // Logic to associate uploaded images with product items
            }

            const serviceProviderData = {
                owner,
                serviceType,
                businessName,
                description,
                location,
                contactInfo,
                equipment: parsedEquipment,
                products: parsedProducts,
                serviceArea: serviceArea ? JSON.parse(serviceArea) : undefined,
                businessHours: businessHours ? JSON.parse(businessHours) : undefined,
                isActive: true, // Automatically active on creation/update
            };

            let serviceProvider = await ServiceProvider.findOne({ owner });

            if (serviceProvider) {
                // Update existing profile
                serviceProvider = await ServiceProvider.findOneAndUpdate({ owner }, serviceProviderData, { new: true });
                res.json(serviceProvider);
            } else {
                // Create new profile
                serviceProvider = new ServiceProvider(serviceProviderData);
                await serviceProvider.save();
                res.status(201).json(serviceProvider);
            }
        } catch (error) {
            console.error('Error creating/updating service provider:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get logged-in service provider's profile
router.get('/my-profile', protect, authorizeRoles('serviceProvider'), async (req, res) => {
    try {
        const serviceProvider = await ServiceProvider.findOne({ owner: req.user.id })
            .populate('owner', 'name profileImage email location');

        if (!serviceProvider) {
            return res.status(404).json({ message: 'Service provider profile not found' });
        }
        res.json(serviceProvider);
    } catch (error) {
        console.error('Error fetching service provider profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get service requests for the logged-in service provider
router.get('/requests/provider', protect, authorizeRoles('serviceProvider'), async (req, res) => {
    try {
        const serviceProviderOwnerId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        // Find the serviceProvider document associated with the owner ID
        const serviceProvider = await ServiceProvider.findOne({ owner: serviceProviderOwnerId });

        if (!serviceProvider) {
            return res.status(404).json({ message: 'Service provider profile not found for this user.' });
        }

        let query = { serviceProvider: serviceProvider._id };
        if (status) {
            query.status = status;
        }

        const requests = await ServiceRequest.find(query)
            .populate('farmer', 'name profileImage phone email')
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
        console.error('Error fetching service requests for provider:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update service request status by service provider
router.put('/requests/:id/status', protect, authorizeRoles('serviceProvider'), async (req, res) => {
    try {
        const { status } = req.body;
        const requestId = req.params.id;
        const serviceProviderOwnerId = req.user.id;

        // Find the serviceProvider document associated with the owner ID
        const serviceProvider = await ServiceProvider.findOne({ owner: serviceProviderOwnerId });

        if (!serviceProvider) {
            return res.status(404).json({ message: 'Service provider profile not found for this user.' });
        }

        const serviceRequest = await ServiceRequest.findOne({
            _id: requestId,
            serviceProvider: serviceProvider._id
        });

        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service request not found or not authorized' });
        }

        serviceRequest.status = status;
        await serviceRequest.save();

        res.json(serviceRequest);
    } catch (error) {
        console.error('Error updating service request status:', error);
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