import api from '../api/axios';

// --- Type Definitions for Weather Data ---

// Main weather data structure
export interface WeatherData {
  location: string;
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
}

// Current weather details
export interface CurrentWeather {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  uvi: number;
  wind_speed: number;
  weather: WeatherCondition[];
  icon: string; // Custom icon from our map
}

// Hourly forecast details
export interface HourlyForecast {
  dt: number;
  temp: number;
  pop: number; // Probability of precipitation
  weather: WeatherCondition[];
  icon: string; // Custom icon
}

// Daily forecast details
export interface DailyForecast {
  dt: number;
  temp: {
    min: number;
    max: number;
  };
  pop: number;
  weather: WeatherCondition[];
  icon: string; // Custom icon
}

// Weather condition (e.g., "Clouds")
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string; // Original OpenWeather icon code
}

// Weather alerts
export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
}

// Geocoding API response
export interface GeoCodeData {
  name: string;
  lat: number;
  lon: number;
  country: string;
}

// --- API Service Functions ---

/**
 * Fetches geocoding information for a given city.
 * @param city - The name of the city to search for.
 * @returns A promise that resolves to geocoding data.
 */
export const getGeoCode = async (city: string): Promise<GeoCodeData> => {
  try {
    const response = await api.get('/weather/geocode', { params: { city } });
    // If the API returns an array, take the first result
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    if (!data || !data.lat || !data.lon) {
      throw new Error('No valid coordinates found for the specified city.');
    }
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch geocoding data.';
    throw new Error(errorMessage);
  }
};

/**
 * Fetches comprehensive weather data for given coordinates.
 * @param lat - Latitude.
 * @param lon - Longitude.
 * @returns A promise that resolves to the full weather data object.
 */
export const getWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await api.get('/weather/onecall', { params: { lat, lon } });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch weather data.';
    throw new Error(errorMessage);
  }
};