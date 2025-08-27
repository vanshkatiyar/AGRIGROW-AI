const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const weatherIconMap = {
    '01d': '☀️', '01n': '🌙', '02d': '⛅️', '02n': '☁️', '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️', '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️', '50d': '🌫️', '50n': '🌫️',
};

router.get('/current', protect, async (req, res) => {
    try {
        // --- THIS IS THE SECOND FIX ---
        // We access the API_KEY here, inside the function, which guarantees
        // that dotenv.config() has already run.
        const API_KEY = process.env.OPENWEATHER_API_KEY;
        
        if (!API_KEY) {
            console.error("CRITICAL: OPENWEATHER_API_KEY is missing from .env file or not loaded.");
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        const { city, lat, lon } = req.query;
        let params;

        if (city) {
            params = { q: city, appid: API_KEY, units: 'metric' };
        } else if (lat && lon) {
            params = { lat, lon, appid: API_KEY, units: 'metric' };
        } else {
            return res.status(400).json({ message: 'City or coordinates are required' });
        }

        const { data } = await axios.get(WEATHER_API_URL, { params });

        const formattedData = {
            location: `${data.name}, ${data.sys.country}`,
            temperature: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            wind_speed: data.wind.speed,
            condition: data.weather[0].main,
            description: data.weather[0].description,
            icon: weatherIconMap[data.weather[0].icon] || '🌦️',
        };

        res.json(formattedData);

    } catch (error) {
        console.error('OpenWeatherMap API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to fetch weather from OpenWeatherMap.' });
    }
});

module.exports = router;