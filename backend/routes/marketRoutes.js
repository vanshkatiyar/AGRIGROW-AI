const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const GOV_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const AGMARKNET_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

// Popular commodities for default view
const popularCommodities = ['Rice', 'Wheat', 'Tomato', 'Onion', 'Potato', 'Cotton', 'Soybean', 'Maize'];

// @route   GET /api/market/prices
// @desc    Fetch mandi prices from data.gov.in with enhanced error handling
// @access  Private
router.get('/prices', protect, async (req, res) => {
    const { state, commodity, limit = '50', sort = 'arrival_date' } = req.query;
    
    console.log(`[Market Route] Received request for state=${state}, commodity=${commodity}, limit=${limit}`);

    try {
        // Build filters for the API
        const filters = {};
        if (state && state !== 'all') filters['state'] = state;
        if (commodity && commodity !== 'popular') filters['commodity'] = commodity;
        
        // For popular commodities, fetch multiple commodities
        const commoditiesToFetch = commodity === 'popular' ? popularCommodities : [commodity];

        let allRecords = [];
        
        // Fetch data for each commodity (for popular view)
        for (const comm of commoditiesToFetch) {
            if (!comm) continue;
            
            const params = {
                'api-key': process.env.GOV_DATA_API_KEY,
                'format': 'json',
                'limit': Math.min(100, parseInt(limit)),
                'filters[commodity]': comm,
                'sort[arrival_date]': 'desc',
                'offset': 0
            };
            
            // Add state filter if specified
            if (state && state !== 'all') {
                params['filters[state]'] = state;
            }

            try {
                console.log(`[Market Route] Fetching data for commodity: ${comm}`);
                const { data } = await axios.get(GOV_API_URL, { 
                    params,
                    timeout: 10000 // 10 second timeout
                });

                if (data.records && data.records.length > 0) {
                    // Enhance records with additional information
                    const enhancedRecords = data.records.map(record => ({
                        ...record,
                        source: 'live',
                        lastUpdated: new Date().toISOString(),
                        // Ensure numeric prices
                        min_price: parseFloat(record.min_price) || 0,
                        max_price: parseFloat(record.max_price) || 0,
                        modal_price: parseFloat(record.modal_price) || 0
                    }));
                    
                    allRecords = allRecords.concat(enhancedRecords);
                }
            } catch (commodityError) {
                console.warn(`[Market Route] Failed to fetch data for ${comm}:`, commodityError.message);
                // Continue with other commodities even if one fails
            }
        }

        // Sort by arrival date (newest first) and limit results
        allRecords.sort((a, b) => new Date(b.arrival_date) - new Date(a.arrival_date));
        allRecords = allRecords.slice(0, parseInt(limit));

        console.log(`[Market Route] Returning ${allRecords.length} records`);

        res.json({
            success: true,
            count: allRecords.length,
            records: allRecords,
            lastUpdated: new Date().toISOString(),
            source: 'government_api'
        });

    } catch (error) {
        console.error('--- MARKET DATA FETCH ERROR ---');
        console.error('Error:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('API Response:', error.response.data);
        }
        console.error('-----------------------------');
        
        // Return structured error response
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch market prices from government portal.',
            error: error.message,
            records: []
        });
    }
});

// @route   GET /api/market/states
// @desc    Get list of available states
// @access  Private
router.get('/states', protect, async (req, res) => {
    try {
        const params = {
            'api-key': process.env.GOV_DATA_API_KEY,
            'format': 'json',
            'limit': 1,
            'fields': 'state',
            'distinct': 'state'
        };

        const { data } = await axios.get(GOV_API_URL, { params });
        
        const states = data.records ? data.records.map(r => r.state).filter(Boolean).sort() : [];
        
        res.json({ success: true, states });
    } catch (error) {
        console.error('Error fetching states:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch states' });
    }
});

// @route   GET /api/market/commodities
// @desc    Get list of available commodities
// @access  Private
router.get('/commodities', protect, async (req, res) => {
    try {
        const params = {
            'api-key': process.env.GOV_DATA_API_KEY,
            'format': 'json',
            'limit': 1,
            'fields': 'commodity',
            'distinct': 'commodity'
        };

        const { data } = await axios.get(GOV_API_URL, { params });
        
        const commodities = data.records ? data.records.map(r => r.commodity).filter(Boolean).sort() : [];
        
        res.json({ success: true, commodities });
    } catch (error) {
        console.error('Error fetching commodities:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch commodities' });
    }
});

module.exports = router;