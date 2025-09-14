import axios from 'axios';
import { mockMarketData, MarketDataRecord as MockRecord } from './mockMarketData';

// Re-export the type for use in components
export type MarketDataRecord = MockRecord;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

export interface MarketDataResponse {
  records: MarketDataRecord[];
  count: number;
}

export const getMarketPrices = async (state: string, commodity: string): Promise<MarketDataResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("User not authenticated.");
    
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      params: { state, commodity }
    };

    // 1. Fetch live data from our backend
    const response = await axios.get(`${API_BASE_URL}/market/prices`, config);
    const liveRecords: MarketDataRecord[] = (response.data.records || []).map((r: any) => ({ ...r, source: 'live' as 'live' }));

    // 2. Filter our mock data for relevant records
    const referenceRecords = mockMarketData.filter(
      record => record.state === state && record.commodity === commodity
    );

    // 3. Combine them: Live data takes priority. Avoid showing the same market twice.
    const liveMarkets = new Set(liveRecords.map(r => r.market.toLowerCase()));
    
    const uniqueReferenceRecords = referenceRecords
      .filter(r => !liveMarkets.has(r.market.toLowerCase()))
      .map(r => ({ ...r, source: 'reference' as 'reference' }));

    // 4. Create the final combined list
    const finalRecords = [...liveRecords, ...uniqueReferenceRecords];
    
    return {
      records: finalRecords,
      count: finalRecords.length,
    };

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "An error occurred while fetching market prices.");
    }
    throw new Error("An unknown error occurred.");
  }
};