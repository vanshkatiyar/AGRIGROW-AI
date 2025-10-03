// services/marketService.ts

const getAuthHeaders = () => {
  console.log('Auth Token:', localStorage.getItem('authToken'));
  const token = localStorage.getItem('authToken');
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
};
const API_BASE_URL = '/api/market';

export interface MarketRecord {
  market: string;
  state: string;
  commodity: string;
  variety: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_date: string;
  source: 'live' | 'today' | 'reference';
  lastUpdated?: string;
}

export interface MarketResponse {
  success: boolean;
  count: number;
  records: MarketRecord[];
  lastUpdated?: string;
  source?: string;
}

export const getMarketPrices = async (state: string, commodity: string): Promise<MarketResponse> => {
  const params = new URLSearchParams();
  if (state) params.append('state', state);
  if (commodity) params.append('commodity', commodity);
  params.append('limit', '100');

  const response = await fetch(`${API_BASE_URL}/prices?${params}`, { headers: getAuthHeaders() });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch market data: ${response.statusText}`);
  }

  return response.json();
};

export const getLiveMarketData = async (state: string = '', type: 'popular' | 'specific' = 'popular'): Promise<MarketResponse> => {
  const params = new URLSearchParams();
  if (state && state !== 'all') params.append('state', state);
  params.append('commodity', type === 'popular' ? 'popular' : '');
  params.append('limit', '50');

  const response = await fetch(`${API_BASE_URL}/prices?${params}`, { headers: getAuthHeaders() });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch live market data: ${response.statusText}`);
  }

  return response.json();
};

export const getAvailableStates = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/states`, { headers: getAuthHeaders() });
  
  if (!response.ok) {
    throw new Error('Failed to fetch states');
  }

  const data = await response.json();
  return data.states || [];
};

export const getAvailableCommodities = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/commodities`, { headers: getAuthHeaders() });
  
  if (!response.ok) {
    throw new Error('Failed to fetch commodities');
  }

  const data = await response.json();
  return data.commodities || [];
};