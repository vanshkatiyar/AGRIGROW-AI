const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

// --- Constants ---
const GEOCODE_API_URL = 'http://api.openweathermap.org/geo/1.0/direct';
const ONE_CALL_API_URL = 'https://api.openweathermap.org/data/3.0/onecall';

// --- Weather Icon Mapping ---
const weatherIconMap = {
    '01d': '☀️', '01n': '🌙', '02d': '⛅️', '02n': '☁️', '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️', '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️', '50d': '🌫️', '50n': '🌫️',
};

// --- Helper Functions ---

/**
 * Formats the raw API response into the structure expected by the frontend.
 * @param {object} data - The raw data from the OpenWeatherMap One Call API.
 * @param {string} locationName - The name of the location.
 * @returns {object} - The formatted weather data.
 */
const formatWeatherData = (data, locationName) => {
    return {
        location: locationName,
        timezone: data.timezone,
        current: {
            ...data.current,
            temp: Math.round(data.current.temp),
            feels_like: Math.round(data.current.feels_like),
            icon: weatherIconMap[data.current.weather[0].icon] || '🌦️',
        },
        hourly: data.hourly.slice(0, 24).map(hour => ({
            ...hour,
            temp: Math.round(hour.temp),
            pop: Math.round(hour.pop * 100),
            icon: weatherIconMap[hour.weather[0].icon] || '🌦️',
        })),
        daily: data.daily.map(day => ({
            ...day,
            temp: {
                min: Math.round(day.temp.min),
                max: Math.round(day.temp.max),
            },
            pop: Math.round(day.pop * 100),
            icon: weatherIconMap[day.weather[0].icon] || '🌦️',
        })),
        alerts: data.alerts || [],
    };
};

// --- API Routes ---

/**
 * Route to get geocoding information for a city.
 * @route GET /api/weather/geocode
 * @protected
 */
router.get('/geocode', protect, async (req, res) => {
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ message: 'City is required' });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
        console.error("CRITICAL: OPENWEATHER_API_KEY is missing.");
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    try {
        const { data } = await axios.get(GEOCODE_API_URL, {
            params: { q: city, limit: 1, appid: API_KEY },
        });

        if (data.length === 0) {
            return res.status(404).json({ message: `Could not find coordinates for city: ${city}` });
        }
        
        res.json(data);

    } catch (error) {
        console.error('Geocoding API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to fetch geocoding data.' });
    }
});

/**
 * Route to get comprehensive weather data using OpenWeatherMap's One Call API.
 * @route GET /api/weather/onecall
 * @protected
 */
router.get('/onecall', protect, async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
        console.error("CRITICAL: OPENWEATHER_API_KEY is missing.");
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    try {
        const { data } = await axios.get(ONE_CALL_API_URL, {
            params: {
                lat,
                lon,
                appid: API_KEY,
                units: 'metric',
                exclude: 'minutely', // Exclude minutely data
            },
        });

        // For location name, we need to do a reverse geocode lookup
        const geoData = await axios.get('http://api.openweathermap.org/geo/1.0/reverse', {
            params: { lat, lon, limit: 1, appid: API_KEY }
        });
        
        const locationName = geoData.data.length > 0 ? `${geoData.data[0].name}, ${geoData.data[0].country}` : 'Unknown Location';

        const formattedData = formatWeatherData(data, locationName);
        res.json(formattedData);

    } catch (error) {
        console.error('One Call API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to fetch weather data from OpenWeatherMap.' });
    }
});

module.exports = router;