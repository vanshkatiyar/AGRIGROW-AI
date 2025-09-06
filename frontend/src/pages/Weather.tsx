import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { getCurrentWeather } from '@/services/weatherService';
import { useUserLocation } from '@/hooks/useUserLocation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CloudSun, 
  Droplets, 
  Wind,
  Thermometer,
  AlertTriangle,
  Search,
  Calendar,
  MapPin
} from 'lucide-react';

// Mock data for the 5-day forecast display
const mockForecast = [
    { date: new Date().setDate(new Date().getDate() + 1), high: 28, low: 18, condition: "Sunny", icon: '☀️', precipitation: 10 },
    { date: new Date().setDate(new Date().getDate() + 2), high: 26, low: 17, condition: "Partly Cloudy", icon: '⛅️', precipitation: 20 },
    { date: new Date().setDate(new Date().getDate() + 3), high: 24, low: 16, condition: "Showers", icon: '🌦️', precipitation: 60 },
    { date: new Date().setDate(new Date().getDate() + 4), high: 27, low: 19, condition: "Clear", icon: '☀️', precipitation: 5 },
    { date: new Date().setDate(new Date().getDate() + 5), high: 29, low: 20, condition: "Sunny", icon: '☀️', precipitation: 10 },
];

const Weather = () => {
  const [city, setCity] = useState('');
  const { coordinates, error: locationError, isLoading: isLoadingLocation } = useUserLocation();

  const mutation = useMutation({
    mutationFn: (query: { city: string } | { lat: number; lon: number }) => getCurrentWeather(query),
    onSuccess: (data) => {
        setCity(data.location.split(',')[0]);
    }
  });

  useEffect(() => {
    if (coordinates) {
      mutation.mutate({ lat: coordinates.latitude, lon: coordinates.longitude });
    }
  }, [coordinates]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      mutation.mutate({ city: city.trim() });
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 35) return 'text-red-500';
    if (temp >= 25) return 'text-orange-500';
    if (temp >= 15) return 'text-green-500';
    return 'text-blue-500';
  };

  const renderCurrentWeather = () => {
    if (isLoadingLocation) {
      return <div className="flex items-center justify-center h-48"><MapPin className="h-6 w-6 mr-2 animate-pulse" /> <p>Detecting your location...</p></div>;
    }
    if (mutation.isPending) {
      return <div className="flex items-center justify-center h-48"><LoadingSpinner /> <p className="ml-2">Fetching weather...</p></div>;
    }
    const errorToShow = mutation.isError ? mutation.error.message : locationError;
    if (errorToShow && !mutation.data) {
      return <Alert variant="destructive" className="mt-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{errorToShow}</AlertDescription></Alert>;
    }
    if (!mutation.data) {
        return <div className="text-center py-12 text-muted-foreground"><CloudSun className="h-12 w-12 mx-auto mb-4" /><p>Search for a city or allow location access.</p></div>;
    }
    const current = mutation.data;
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CloudSun className="h-6 w-6" />Current Weather</CardTitle>
          <CardDescription>{current.location}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* --- THIS IS THE CORRECTED SECTION --- */}
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <div className="text-6xl">{current.icon}</div>
              <div>
                <div className={`text-5xl font-bold ${getTemperatureColor(current.temperature)}`}>
                  {current.temperature}°C
                </div>
                <div className="text-lg text-muted-foreground capitalize">
                  {current.description}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Humidity</div>
                  <div className="font-semibold">{current.humidity}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Wind</div>
                  <div className="font-semibold">{current.wind_speed} km/h</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-red-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Feels Like</div>
                  <div className="font-semibold">{current.feels_like}°C</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="mb-6"><h1 className="text-3xl font-bold text-foreground mb-2">Weather Dashboard</h1><p className="text-muted-foreground">Live weather data and a 5-day forecast for your farm.</p></div>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Search for a city..." value={city} onChange={(e) => setCity(e.target.value)} className="pl-10" /></div>
          <Button type="submit" className="w-full sm:w-auto" disabled={mutation.isPending}>{mutation.isPending ? 'Searching...' : 'Search'}</Button>
        </form>
        
        {renderCurrentWeather()}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />5-Day Forecast</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {mockForecast.map((day, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center justify-between p-3 border-b last:border-b-0">
                <div className="w-full sm:w-1/4 text-center sm:text-left mb-2 sm:mb-0"><p className="font-semibold">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</p></div>
                <div className="flex items-center gap-2 text-2xl w-full sm:w-auto justify-center mb-2 sm:mb-0">{day.icon}<span className="text-lg font-medium capitalize">{day.condition}</span></div>
                <div className="flex items-center justify-around w-full sm:w-1/2">
                  <div className="text-center px-2"><p className={`font-bold ${getTemperatureColor(day.high)}`}>{day.high}°</p><p className="text-xs text-muted-foreground">High</p></div>
                  <div className="text-center px-2"><p className="font-bold text-muted-foreground">{day.low}°</p><p className="text-xs text-muted-foreground">Low</p></div>
                  <div className="text-center px-2"><p className="font-bold text-blue-500">{day.precipitation}%</p><p className="text-xs text-muted-foreground">Rain</p></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Weather;