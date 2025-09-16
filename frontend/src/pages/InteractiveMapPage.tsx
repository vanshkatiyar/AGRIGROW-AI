import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Libraries } from '@react-google-maps/api';
import io from 'socket.io-client';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

const center = {
  lat: 20.5937, // Default center (e.g., India)
  lng: 78.9629,
};

interface Provider {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const mockProviders: Provider[] = [
  { id: '1', name: 'Provider A', lat: 20.5937 + 0.1, lng: 78.9629 + 0.1 },
  { id: '2', name: 'Provider B', lat: 20.5937 - 0.1, lng: 78.9629 - 0.1 },
  { id: '3', name: 'Provider C', lat: 20.5937, lng: 78.9629 + 0.2 },
];

const libraries: Libraries = ["places"];

const InteractiveMapPage: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your actual API key
    libraries,
  });

  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [serviceStatus, setServiceStatus] = useState<string | null>(null);

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
      // Add authentication token if needed
      // auth: { token: 'YOUR_AUTH_TOKEN' }
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('receive_provider_location', (data: { providerId: string; lat: number; lng: number }) => {
      setProviders(prevProviders =>
        prevProviders.map(p =>
          p.id === data.providerId ? { ...p, lat: data.lat, lng: data.lng } : p
        )
      );
    });

    socket.on('receive_farmer_location', (data: { farmerId: string; lat: number; lng: number }) => {
      console.log(`Farmer ${data.farmerId} is at ${data.lat}, ${data.lng}`);
      // You might want to display this on the provider's map
    });

    socket.on('service_status_update', (data: { serviceId: string; status: string; providerId?: string; farmerId?: string }) => {
      setServiceStatus(`Service ${data.serviceId} status: ${data.status}`);
      // Handle UI updates based on service status
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          // Optionally send farmer's location to backend if a service is active
          // if (selectedProvider && serviceStatus === 'accepted') {
          //   socket.emit('farmer_location_share', { farmerId: 'mock_farmer_id', providerId: selectedProvider.id, lat: latitude, lng: longitude });
          // }
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    }
  }, [selectedProvider, serviceStatus]);

  const handleServiceRequest = async (providerId: string) => {
    setServiceStatus('Requesting service...');
    try {
      const response = await fetch('/api/map/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ farmerId: 'mock_farmer_id', providerId }),
      });
      const data = await response.json();
      if (response.ok) {
        setServiceStatus(`Service requested! Service ID: ${data.serviceId}`);
        // Emit a socket event to notify the provider
        // socket.emit('service_request', { farmerId: 'mock_farmer_id', providerId, serviceId: data.serviceId });
      } else {
        setServiceStatus(`Error: ${data.message}`);
      }
    } catch (error) {
      setServiceStatus(`Error requesting service: ${error}`);
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps</div>;

  return (
    <div>
      <h1>Interactive Map</h1>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={5}
        center={center}
        onLoad={onMapLoad}
      >
        {providers.map((provider) => (
          <Marker
            key={provider.id}
            position={{ lat: provider.lat, lng: provider.lng }}
            title={provider.name}
            onClick={() => setSelectedProvider(provider)}
          />
        ))}
      </GoogleMap>
      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'white', padding: '10px', zIndex: 10 }}>
        <button onClick={() => {
          // Simulate fetching nearby providers
          const newProviders = mockProviders.filter(p => Math.random() > 0.5); // Example filter
          setProviders(newProviders);
        }}>
          Find Nearby Providers
        </button>
        {selectedProvider && (
          <div>
            <h2>Selected Provider: {selectedProvider.name}</h2>
            <button onClick={() => handleServiceRequest(selectedProvider.id)}>
              Request Service
            </button>
          </div>
        )}
        {currentLocation && (
          <Marker
            position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
            title="Your Location"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new google.maps.Size(30, 30)
            }}
          />
        )}
        {currentLocation && (
          <Marker
            position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
            title="Your Location"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new google.maps.Size(30, 30)
            }}
          />
        )}
        {serviceStatus && <p>{serviceStatus}</p>}
      </div>
    </div>
  );
};

export default InteractiveMapPage;