const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const GOV_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

// @route   GET /api/market/prices
// @desc    Fetch mandi prices from data.gov.in
// @access  Private
router.get('/prices', protect, async (req, res) => {
    const { state, commodity } = req.query;
    console.log(`[Market Route] Received request for state=${state}, commodity=${commodity}`);

    if (!state || !commodity) {
        return res.status(400).json({ message: 'State and commodity query parameters are required' });
    }

    try {
        const params = {
            'api-key': process.env.GOV_DATA_API_KEY,
            'format': 'json',
            'limit': '100', // Fetch up to 100 records
            'filters[state]': state,
            'filters[commodity]': commodity,
        };
        
        console.log('[Market Route] Sending request to data.gov.in...');
        const { data } = await axios.get(GOV_API_URL, { params });
        console.log(`[Market Route] Received ${data.records ? data.records.length : 0} records from data.gov.in`);

        res.json(data); // Forward the successful response to our frontend

    } catch (error) {
        console.error('--- DATA.GOV.IN API ERROR ---');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
        console.error('-----------------------------');
        res.status(500).json({ message: 'Failed to fetch market prices from the government portal.' });
    }
});

module.exports = router;