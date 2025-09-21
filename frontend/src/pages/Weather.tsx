import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WeatherBackground from '@/components/common/WeatherBackground';
import ScrollToTop from '@/components/common/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getGeoCode, getWeather, WeatherData } from '@/services/weatherService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Sun, Wind, Droplets, Gauge, Sunrise, Sunset, MapPin, Search, Calendar, Clock, AlertTriangle
} from 'lucide-react';
import '../styles/animations.css';

// Helper Functions and Components
const formatTime = (timestamp: number, timezone: string) => 
  new Date(timestamp * 1000).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });

const formatDay = (timestamp: number, timezone: string) => 
  new Date(timestamp * 1000).toLocaleDateString('en-US', { timeZone: timezone, weekday: 'long' });

const WeatherDetail = ({ icon, label, value, index }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string | number,
  index: number 
}) => (
  <div className={`flex items-center gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-green-100 hover-lift animate-fade-in-up animate-stagger-${index + 1}`}>
    <div className="text-green-600 weather-icon">{icon}</div>
    <div>
      <div className="text-sm text-green-600 font-medium">{label}</div>
      <div className="font-bold text-gray-800">{value}</div>
    </div>
  </div>
);

const NewWeather = () => {
  const [city, setCity] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  
  const { coordinates: userLocation, error: locationError } = useUserLocation();

  useEffect(() => {
    if (userLocation) {
      setCoordinates({ lat: userLocation.latitude, lon: userLocation.longitude });
    }
  }, [userLocation]);

  const geoCodeMutation = useMutation({
    mutationFn: getGeoCode,
    onSuccess: (data) => {
      setCoordinates({ lat: data.lat, lon: data.lon });
    },
  });

  const { data: weather, isLoading: isLoadingWeather, isError: isWeatherError, error: weatherError } = useQuery<WeatherData>({
    queryKey: ['weather', coordinates],
    queryFn: () => getWeather(coordinates!.lat, coordinates!.lon),
    enabled: !!coordinates,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      geoCodeMutation.mutate(city.trim());
    }
  };

  const renderCurrentWeather = (data: WeatherData) => (
    <Card className="weather-card hover-lift animate-scale-in overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-white">
        <CardTitle className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="text-green-600 h-8 w-8" />
          {data.location}
        </CardTitle>
        <CardDescription className="text-lg text-green-600">
          As of {formatTime(data.current.dt, data.timezone)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6 animate-slide-in-left">
            <div className="text-8xl weather-icon">{data.current.icon}</div>
            <div>
              <div className="text-7xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                {data.current.temp}°C
              </div>
              <div className="text-xl capitalize text-gray-600 font-medium">
                {data.current.weather[0].description}
              </div>
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-700 animate-slide-in-right">
            Feels like <span className="text-green-600">{data.current.feels_like}°C</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <WeatherDetail icon={<Droplets size={24} />} label="Humidity" value={`${data.current.humidity}%`} index={0} />
          <WeatherDetail icon={<Wind size={24} />} label="Wind Speed" value={`${data.current.wind_speed} m/s`} index={1} />
          <WeatherDetail icon={<Sun size={24} />} label="UV Index" value={data.current.uvi} index={2} />
          <WeatherDetail icon={<Gauge size={24} />} label="Pressure" value={`${data.current.pressure} hPa`} index={3} />
          <WeatherDetail icon={<Sunrise size={24} />} label="Sunrise" value={formatTime(data.current.sunrise, data.timezone)} index={4} />
          <WeatherDetail icon={<Sunset size={24} />} label="Sunset" value={formatTime(data.current.sunset, data.timezone)} index={5} />
        </div>
      </CardContent>
    </Card>
  );

  const renderHourlyForecast = (data: WeatherData) => (
    <Card className="card-animated animate-fade-in-up animate-stagger-2">
      <CardHeader className="bg-gradient-to-r from-green-50 to-white">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Clock size={24} className="text-green-600" />
          Hourly Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {data.hourly.map((hour, index) => (
            <div 
              key={hour.dt} 
              className={`flex flex-col items-center gap-3 p-4 rounded-xl bg-white border border-green-100 min-w-[100px] hover-lift animate-scale-in animate-stagger-${Math.min(index + 1, 5)}`}
            >
              <div className="text-sm font-semibold text-gray-700">{formatTime(hour.dt, data.timezone)}</div>
              <div className="text-4xl weather-icon">{hour.icon}</div>
              <div className="text-xl font-bold text-gray-800">{hour.temp}°</div>
              <div className="text-sm text-green-600 flex items-center gap-1 font-medium">
                <Droplets size={14} /> {hour.pop}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderDailyForecast = (data: WeatherData) => (
    <Card className="card-animated animate-fade-in-up animate-stagger-3">
      <CardHeader className="bg-gradient-to-r from-green-50 to-white">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Calendar size={24} className="text-green-600" />
          8-Day Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-6">
        {data.daily.map((day, index) => (
          <div 
            key={day.dt} 
            className={`grid grid-cols-3 md:grid-cols-5 items-center gap-4 p-4 border-b border-green-100 last:border-0 hover:bg-green-50 transition-colors duration-200 rounded-lg animate-slide-in-right animate-stagger-${Math.min(index + 1, 5)}`}
          >
            <div className="md:col-span-2 font-bold text-gray-800">{formatDay(day.dt, data.timezone)}</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl weather-icon">{day.icon}</span>
              <span className="hidden md:inline capitalize font-medium text-gray-600">{day.weather[0].main}</span>
            </div>
            <div className="text-center text-sm text-green-600 font-medium">{day.pop}% rain</div>
            <div className="text-right font-bold text-lg">
              <span className="text-gray-800">{day.temp.max}°</span> / 
              <span className="text-gray-500">{day.temp.min}°</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderAlerts = (data: WeatherData) => (
    data.alerts.length > 0 && (
      <div className="space-y-4">
        {data.alerts.map((alert, index) => (
          <Alert key={index} className="border-red-200 bg-red-50 animate-bounce">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800 font-bold">{alert.event} issued by {alert.sender_name}</AlertTitle>
            <AlertDescription className="mt-2 text-red-700">{alert.description}</AlertDescription>
          </Alert>
        ))}
      </div>
    )
  );

  return (
    <Layout>
      <div className="relative min-h-screen">
        {weather && <WeatherBackground weatherCondition={weather.current.weather[0].main} />}
        <div className="container mx-auto p-4 sm:p-6 space-y-8 relative z-10">
          
          <div className="mb-8 text-center animate-fade-in-up">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-4">
              Weather Dashboard
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Comprehensive weather insights for better farming decisions
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto animate-slide-in-up">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
              <Input
                placeholder="Search for your location..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-12 h-14 text-lg border-green-200 focus:border-green-500 focus:ring-green-200 rounded-xl form-input"
              />
            </div>
            <Button 
              type="submit" 
              className="h-14 px-8 text-lg btn-primary rounded-xl font-semibold" 
              disabled={geoCodeMutation.isPending}
            >
              {geoCodeMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner w-5 h-5" />
                  Searching...
                </div>
              ) : (
                'Search Weather'
              )}
            </Button>
          </form>
          
          {geoCodeMutation.isError && (
            <Alert className="border-red-200 bg-red-50 max-w-2xl mx-auto animate-scale-in">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800">Search Error</AlertTitle>
              <AlertDescription className="text-red-700">{geoCodeMutation.error.message}</AlertDescription>
            </Alert>
          )}

          {isLoadingWeather && (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="loading-spinner w-12 h-12 mx-auto mb-4" />
              <p className="text-xl text-gray-600 font-medium">Fetching weather data...</p>
            </div>
          )}
          
          {isWeatherError && !weather && (
            <Alert className="border-red-200 bg-red-50 max-w-2xl mx-auto animate-scale-in">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800">Weather Error</AlertTitle>
              <AlertDescription className="text-red-700">{weatherError.message}</AlertDescription>
            </Alert>
          )}

          {!coordinates && !locationError && (
            <div className="text-center py-16 text-gray-600 animate-pulse">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <p className="text-xl font-medium">Detecting your location...</p>
            </div>
          )}
          
          {locationError && !coordinates && (
            <Alert className="max-w-2xl mx-auto border-green-200 bg-green-50 animate-scale-in">
              <MapPin className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800">Location Services</AlertTitle>
              <AlertDescription className="text-green-700">
                Please enable location services or search for a city to get weather information.
              </AlertDescription>
            </Alert>
          )}

          {weather && (
            <div className="space-y-8">
              {renderAlerts(weather)}
              {renderCurrentWeather(weather)}
              {renderHourlyForecast(weather)}
              {renderDailyForecast(weather)}
            </div>
          )}
          
        </div>
        <ScrollToTop />
      </div>
    </Layout>
  );
};

export default NewWeather;