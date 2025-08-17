import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const weatherIconMap: { [key: string]: string } = {
  '01d': '☀️', '01n': '🌙', '02d': '⛅️', '02n': '☁️', '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️', '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️', '50d': '🌫️', '50n': '🌫️',
};

export interface CurrentWeatherData {
  location: string; temperature: number; feels_like: number; humidity: number;
  wind_speed: number; condition: string; description: string; icon: string;
}
export interface ForecastDayData {
  date: number; high: number; low: number; condition: string; icon: string;
  precipitation: number; humidity: number; wind_speed: number;
}
export interface FullWeatherData {
  current: CurrentWeatherData; forecast: ForecastDayData[];
}

export const getWeatherAndForecast = async (
  query: { city: string } | { lat: number; lon: number }
): Promise<FullWeatherData> => {
  if (!API_KEY) throw new Error("API key is missing. Please add VITE_OPENWEATHER_API_KEY to your .env file.");

  const currentParams = 'city' in query ? { q: query.city } : { lat: query.lat, lon: query.lon };
  const forecastParams = 'city' in query ? { q: query.city } : { lat: query.lat, lon: query.lon };

  try {
    const [currentWeatherResponse, forecastResponse] = await Promise.all([
      axios.get(CURRENT_WEATHER_URL, { params: { ...currentParams, appid: API_KEY, units: 'metric' } }),
      axios.get(FORECAST_URL, { params: { ...forecastParams, appid: API_KEY, units: 'metric' } })
    ]);

    const currentData = currentWeatherResponse.data;
    const current: CurrentWeatherData = {
      location: `${currentData.name}, ${currentData.sys.country}`,
      temperature: Math.round(currentData.main.temp),
      feels_like: Math.round(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      wind_speed: currentData.wind.speed,
      condition: currentData.weather[0].main,
      description: currentData.weather[0].description,
      icon: weatherIconMap[currentData.weather[0].icon] || '🌦️',
    };

    const forecastData = forecastResponse.data;
    const dailyForecasts: { [key: string]: any } = {};
    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = { date: item.dt * 1000, high: -Infinity, low: Infinity, precipitations: [], humidities: [], wind_speeds: [], conditions: {}, representativeIcon: null };
      }
      const dayData = dailyForecasts[date];
      dayData.high = Math.max(dayData.high, item.main.temp_max);
      dayData.low = Math.min(dayData.low, item.main.temp_min);
      dayData.precipitations.push(item.pop || 0);
      dayData.humidities.push(item.main.humidity);
      dayData.wind_speeds.push(item.wind.speed);
      if (new Date(item.dt * 1000).getUTCHours() >= 12 && !dayData.representativeIcon) {
        dayData.representativeCondition = item.weather[0].main;
        dayData.representativeIcon = weatherIconMap[item.weather[0].icon] || '🌦️';
      }
    });

    const forecast: ForecastDayData[] = Object.values(dailyForecasts).map((day: any) => ({
      date: day.date,
      high: Math.round(day.high),
      low: Math.round(day.low),
      condition: day.representativeCondition || day.conditions[0],
      icon: day.representativeIcon || '🌦️',
      precipitation: Math.round(Math.max(...day.precipitations) * 100),
      humidity: Math.round(day.humidities.reduce((a: number, b: number) => a + b, 0) / day.humidities.length),
      wind_speed: parseFloat((day.wind_speeds.reduce((a: number, b: number) => a + b, 0) / day.wind_speeds.length).toFixed(1)),
    }));
    
    return { current, forecast: forecast.slice(0, 5) };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) throw new Error("Invalid API key. Please check your OpenWeatherMap API key.");
      if (error.response?.status === 404) throw new Error(`Could not find weather data. Please check the spelling.`);
    }
    throw new Error("Could not retrieve weather information at this time.");
  }
};