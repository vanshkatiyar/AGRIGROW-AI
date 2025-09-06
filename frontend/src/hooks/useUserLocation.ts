import { useState, useEffect } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface UserLocation {
  coordinates: Coordinates | null;
  error: string | null;
  isLoading: boolean;
}

export const useUserLocation = (): UserLocation => {
  const [location, setLocation] = useState<UserLocation>({
    coordinates: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        coordinates: null,
        error: 'Geolocation is not supported by your browser.',
        isLoading: false,
      });
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        error: null,
        isLoading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'An unknown error occurred.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Please enable location access in your browser to see local weather automatically.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'The request to get user location timed out.';
          break;
      }
      setLocation({
        coordinates: null,
        error: errorMessage,
        isLoading: false,
      });
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);

  }, []);

  return location;
};