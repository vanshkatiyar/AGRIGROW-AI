import api from '../api/axios';

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
  const endpoint = '/weather/current';
  const params = 'city' in query ? { city: query.city } : { lat: query.lat, lon: query.lon };

  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    // Axios errors are handled by the interceptor, but we can still catch other errors
    if (error.response) {
      throw new Error(error.response.data.message || "An error occurred while fetching weather.");
    }
    throw new Error("Could not connect to the weather service.");
  }
};