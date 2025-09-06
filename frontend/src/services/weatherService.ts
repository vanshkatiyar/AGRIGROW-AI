import axios from 'axios';

// The base URL MUST point to your own backend server
const API_BASE_URL = 'http://localhost:5000/api';

// Define the data structure for current weather
export interface CurrentWeatherData {
  location: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  description: string;
  icon: string;
}

// This function now calls YOUR backend, not OpenWeatherMap
export const getCurrentWeather = async (
  query: { city: string } | { lat: number; lon: number }
): Promise<CurrentWeatherData> => {
  if (!localStorage.getItem('authToken')) {
    throw new Error("User not authenticated.");
  }

  // Determine the correct endpoint and parameters for your backend
  const endpoint = '/weather/current'; // We will create this backend route
  const params = 'city' in query ? { city: query.city } : { lat: query.lat, lon: query.lon };
  
  try {
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        params: params
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "An error occurred while fetching weather.");
    }
    throw new Error("Could not connect to the weather service.");
  }
};