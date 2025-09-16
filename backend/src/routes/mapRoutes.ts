import express from 'express';
const router = express.Router();

// Mock data for providers
let providers = [
  { id: '1', name: 'Provider A', lat: 20.5937 + 0.1, lng: 78.9629 + 0.1, available: true },
  { id: '2', name: 'Provider B', lat: 20.5937 - 0.1, lng: 78.9629 - 0.1, available: true },
  { id: '3', name: 'Provider C', lat: 20.5937, lng: 78.9629 + 0.2, available: false },
];

// GET /api/map/providers/nearby - find providers near farmer
router.get('/providers/nearby', (req, res) => {
  // In a real application, this would involve spatial queries to a database
  // For now, we return all available mock providers
  const nearbyProviders = providers.filter(p => p.available);
  res.json(nearbyProviders);
});

// POST /api/map/services - farmer requests service
router.post('/services', (req, res) => {
  const { farmerId, providerId } = req.body;
  // In a real application, this would create a service request in the database
  // and notify the provider.
  console.log(`Service request from farmer ${farmerId} to provider ${providerId}`);
  res.status(200).json({ message: 'Service request sent', serviceId: 'mock_service_id_123' });
});

// POST /api/map/services/:id/accept – provider accepts
router.post('/services/:id/accept', (req, res) => {
  const { id } = req.params;
  // In a real application, this would update the service status in the database
  // and notify the farmer.
  console.log(`Service ${id} accepted by provider`);
  res.status(200).json({ message: `Service ${id} accepted` });
});

export default router;