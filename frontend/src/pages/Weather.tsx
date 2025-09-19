import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WeatherBackground from '@/components/common/WeatherBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getGeoCode, getWeather, WeatherData } from '@/services/weatherService'; // <-- Use the new service
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Sun, Wind, Droplets, Gauge, Eye, Sunrise, Sunset, MapPin, Search, Calendar, Clock, AlertTriangle, CloudSun
} from 'lucide-react';

// --- Helper Functions and Components ---

// Formats a UNIX timestamp to a readable time string (e.g., "06:30 AM")
const formatTime = (timestamp: number, timezone: string) => 
  new Date(timestamp * 1000).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });

// Formats a UNIX timestamp to a readable day string (e.g., "Tuesday")
const formatDay = (timestamp: number, timezone: string) => 
  new Date(timestamp * 1000).toLocaleDateString('en-US', { timeZone: timezone, weekday: 'long' });

// A small component for displaying a single piece of weather data
const WeatherDetail = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="flex items-center gap-3">
    <div className="text-primary">{icon}</div>
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  </div>
);

// --- Main Weather Page Component ---

const NewWeather = () => {
  const [city, setCity] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  
  // Hook to get user's initial location
  const { coordinates: userLocation, error: locationError } = useUserLocation();

  // Set coordinates from user's location once on initial load
  useEffect(() => {
    if (userLocation) {
      setCoordinates({ lat: userLocation.latitude, lon: userLocation.longitude });
    }
  }, [userLocation]);

  // React Query mutation for searching a city
  const geoCodeMutation = useMutation({
    mutationFn: getGeoCode,
    onSuccess: (data) => {
      setCoordinates({ lat: data.lat, lon: data.lon });
    },
  });

  // React Query for fetching weather data whenever coordinates change
  const { data: weather, isLoading: isLoadingWeather, isError: isWeatherError, error: weatherError } = useQuery<WeatherData>({
    queryKey: ['weather', coordinates],
    queryFn: () => getWeather(coordinates!.lat, coordinates!.lon),
    enabled: !!coordinates, // Only run this query if coordinates are not null
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      geoCodeMutation.mutate(city.trim());
    }
  };

  // --- Render Functions for Different UI Sections ---

  const renderCurrentWeather = (data: WeatherData) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{data.location}</CardTitle>
        <CardDescription>
          As of {formatTime(data.current.dt, data.timezone)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-7xl">{data.current.icon}</div>
            <div>
              <div className="text-6xl font-bold">{data.current.temp}°C</div>
              <div className="text-lg capitalize text-muted-foreground">
                {data.current.weather[0].description}
              </div>
            </div>
          </div>
          <div className="text-lg">
            Feels like {data.current.feels_like}°C
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <WeatherDetail icon={<Droplets size={20} />} label="Humidity" value={`${data.current.humidity}%`} />
          <WeatherDetail icon={<Wind size={20} />} label="Wind" value={`${data.current.wind_speed} m/s`} />
          <WeatherDetail icon={<Sun size={20} />} label="UV Index" value={data.current.uvi} />
          <WeatherDetail icon={<Gauge size={20} />} label="Pressure" value={`${data.current.pressure} hPa`} />
          <WeatherDetail icon={<Sunrise size={20} />} label="Sunrise" value={formatTime(data.current.sunrise, data.timezone)} />
          <WeatherDetail icon={<Sunset size={20} />} label="Sunset" value={formatTime(data.current.sunset, data.timezone)} />
        </div>
      </CardContent>
    </Card>
  );

  const renderHourlyForecast = (data: WeatherData) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Clock size={20} />Hourly Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto space-x-4 pb-2">
          {data.hourly.map((hour) => (
            <div key={hour.dt} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50 min-w-[80px]">
              <div className="text-sm font-medium">{formatTime(hour.dt, data.timezone)}</div>
              <div className="text-3xl">{hour.icon}</div>
              <div className="text-lg font-bold">{hour.temp}°</div>
              <div className="text-xs text-blue-500 flex items-center gap-1">
                <Droplets size={12} /> {hour.pop}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderDailyForecast = (data: WeatherData) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Calendar size={20} />8-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.daily.map((day) => (
          <div key={day.dt} className="grid grid-cols-3 md:grid-cols-5 items-center gap-4 p-2 border-b last:border-0">
            <div className="md:col-span-2 font-semibold">{formatDay(day.dt, data.timezone)}</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">{day.icon}</span>
              <span className="hidden md:inline capitalize">{day.weather[0].main}</span>
            </div>
            <div className="text-center text-sm text-blue-500">{day.pop}% chance of rain</div>
            <div className="text-right font-semibold">
              {day.temp.max}° / <span className="text-muted-foreground">{day.temp.min}°</span>
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
          <Alert key={index} variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{alert.event} issued by {alert.sender_name}</AlertTitle>
            <AlertDescription className="mt-2">{alert.description}</AlertDescription>
          </Alert>
        ))}
      </div>
    )
  );

  return (
    <Layout>
      <div className="relative min-h-screen"> {/* Ensure the container is relative for the absolute background */}
        {weather && <WeatherBackground weatherCondition={weather.current.weather[0].main} />}
        <div className="container mx-auto p-4 sm:p-6 space-y-6 relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Weather Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive weather data and forecasts for your location.</p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for a city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto" disabled={geoCodeMutation.isPending}>
            {geoCodeMutation.isPending ? 'Searching...' : 'Search'}
          </Button>
        </form>
        
        {geoCodeMutation.isError && (
            <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{geoCodeMutation.error.message}</AlertDescription></Alert>
        )}

        {isLoadingWeather && <div className="text-center py-12"><LoadingSpinner /> <p className="mt-2">Fetching weather data...</p></div>}
        {isWeatherError && !weather && (
             <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{weatherError.message}</AlertDescription></Alert>
        )}

        {!coordinates && !locationError && (
             <div className="text-center py-12 text-muted-foreground"><MapPin className="h-12 w-12 mx-auto mb-4" /><p>Waiting for location...</p></div>
        )}
        
        {locationError && !coordinates && (
            <Alert><MapPin className="h-4 w-4" /><AlertTitle>Location Access Denied</AlertTitle><AlertDescription>Please enable location services or search for a city to get weather information.</AlertDescription></Alert>
        )}

        {weather && (
          <div className="space-y-6">
            {renderAlerts(weather)}
            {renderCurrentWeather(weather)}
            {renderHourlyForecast(weather)}
            {renderDailyForecast(weather)}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default NewWeather;