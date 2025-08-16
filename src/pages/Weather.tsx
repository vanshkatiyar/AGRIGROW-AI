import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Eye,
  Thermometer,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { mockWeatherData } from '@/services/mockData';

const Weather = () => {
  const { current, forecast, farmingTips } = mockWeatherData;

  const getTemperatureColor = (temp: number) => {
    if (temp >= 35) return 'text-red-500';
    if (temp >= 25) return 'text-orange-500';
    if (temp >= 15) return 'text-green-500';
    return 'text-blue-500';
  };

  const getPrecipitationLevel = (precipitation: number) => {
    if (precipitation >= 70) return { label: 'Heavy', color: 'bg-red-500' };
    if (precipitation >= 30) return { label: 'Moderate', color: 'bg-yellow-500' };
    if (precipitation > 0) return { label: 'Light', color: 'bg-blue-500' };
    return { label: 'None', color: 'bg-gray-300' };
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Weather Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time weather data and farming recommendations for {mockWeatherData.location}
          </p>
        </div>

        {/* Current Weather */}
        <Card className="bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudSun className="h-6 w-6" />
              Current Weather
            </CardTitle>
            <CardDescription>{mockWeatherData.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Main Weather */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="text-6xl">{current.icon}</div>
                  <div>
                    <div className={`text-4xl font-bold ${getTemperatureColor(current.temperature)}`}>
                      {current.temperature}°C
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {current.condition}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Details */}
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
                    <div className="text-sm text-muted-foreground">Wind Speed</div>
                    <div className="font-semibold">{current.windSpeed} km/h</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Visibility</div>
                    <div className="font-semibold">10 km</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Feels Like</div>
                    <div className="font-semibold">{current.temperature + 2}°C</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7-Day Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              7-Day Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {forecast.map((day, index) => {
                const precipLevel = getPrecipitationLevel(day.precipitation);
                return (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-sm font-medium mb-2">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-3xl mb-2">{day.icon}</div>
                      <div className="text-lg font-semibold">{day.condition}</div>
                      <div className="flex justify-center gap-2 mt-2">
                        <span className={`font-bold ${getTemperatureColor(day.high)}`}>
                          {day.high}°
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-muted-foreground">{day.low}°</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${precipLevel.color}`}></div>
                          <span className="text-xs text-muted-foreground">
                            {precipLevel.label} ({day.precipitation}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Farming Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Farming Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered tips based on current weather conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {farmingTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <p className="text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weather Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Weather Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      High Humidity Alert
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Current humidity levels may increase disease risk. Monitor crops closely.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Optimal Growing Conditions
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Perfect temperature range for wheat and rice cultivation.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historical Data */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>Weather patterns for farming planning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">24°C</div>
                <div className="text-sm text-muted-foreground">Avg Temperature</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-500">65%</div>
                <div className="text-sm text-muted-foreground">Avg Humidity</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-500">180mm</div>
                <div className="text-sm text-muted-foreground">Total Rainfall</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-500">12 km/h</div>
                <div className="text-sm text-muted-foreground">Avg Wind Speed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Weather;