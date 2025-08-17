import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOV_DATA_API_KEY;
const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

export interface MarketDataRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

export interface MarketDataResponse {
  records: MarketDataRecord[];
  count: number;
}

export const getMarketPrices = async (state: string, commodity: string): Promise<MarketDataResponse> => {
  if (!API_KEY) {
    throw new Error("Government Data API key is missing. Please add VITE_GOV_DATA_API_KEY to your .env file.");
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        'api-key': API_KEY,
        'format': 'json',
        'offset': '0',
        'limit': '100', // Get up to 100 records
        'filters[state]': state,
        'filters[commodity]': commodity,
      },
    });

    const data = response.data;
    
    return {
      records: data.records,
      count: data.count,
    };

  } catch (error) {
    console.error("Failed to fetch market data:", error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("Invalid API key for data.gov.in. Please check your key.");
    }
    throw new Error("Could not retrieve market price information at this time.");
  }
};