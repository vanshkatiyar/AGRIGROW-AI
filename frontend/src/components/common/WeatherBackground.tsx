import React from 'react';
import AnimatedParticles from './AnimatedParticles';

const WeatherBackground = ({ weatherCondition }: { weatherCondition: string }) => {
  const getWeatherBackground = () => {
    switch (weatherCondition) {
      case 'Clear':
        return 'bg-gradient-to-br from-blue-400 to-blue-600';
      case 'Clouds':
        return 'bg-gradient-to-br from-gray-400 to-gray-600';
      case 'Rain':
        return 'bg-gradient-to-br from-blue-700 to-blue-900';
      case 'Drizzle':
        return 'bg-gradient-to-br from-blue-300 to-blue-500';
      case 'Thunderstorm':
        return 'bg-gradient-to-br from-gray-800 to-gray-900';
      case 'Snow':
        return 'bg-gradient-to-br from-white to-gray-200';
      default:
        return 'bg-gradient-to-br from-blue-400 to-blue-600';
    }
  };

  return (
    <>
      <div className={`absolute inset-0 -z-20 transition-all duration-1000 ${getWeatherBackground()}`} />
      <AnimatedParticles weatherCondition={weatherCondition} />
    </>
  );
};

export default WeatherBackground;