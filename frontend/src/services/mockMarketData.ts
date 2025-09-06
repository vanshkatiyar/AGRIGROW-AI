// src/services/mockMarketData.ts

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
  source?: 'live' | 'reference'; // To distinguish between live and mock data
}

// A comprehensive list of states from your CSV for the dropdown filter
export const allStates = [
  "Andhra Pradesh", "Gujarat", "Haryana", "Kerala", "Punjab", "Rajasthan", "Telangana", "Uttar Pradesh"
].sort();

// A comprehensive list of commodities from your CSV for the dropdown filter
export const allCommodities = [
  "Amaranthus", "Amphophalus", "Apple", "Arhar (Tur/Red Gram)(Whole)", "Ashgourd", "Banana", "Banana - Green", "Beans", "Beetroot",
  "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower",
  "Cluster beans", "Coconut", "Colacasia", "Cowpea(Veg)", "Cucumbar(Kheera)", "Dry Chillies", "Drumstick", "Elephant Yam (Suran)",
  "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Chilli", "Green Peas", "Guar", "Guava", "Gur(Jaggery)",
  "Indian Beans (Seam)", "Lemon", "Lime", "Little gourd (Kundru)", "Maize", "Mango", "Mango (Raw-Ripe)", "Mousambi(Sweet Lime)",
  "Onion", "Paddy(Dhan)", "Papaya", "Pineapple", "Pointed gourd (Parval)", "Pomegranate", "Potato", "Pumpkin", "Raddish",
  "Round gourd", "Snakeguard", "Sponge gourd", "Tapioca", "Tinda", "Tomato", "Wheat"
].sort();


// This is the data from your CSV file, formatted as a JavaScript array
export const mockMarketData: MarketDataRecord[] = [
  { state: "Gujarat", district: "Narmada", market: "Rajpipla", commodity: "Banana", variety: "Other", arrival_date: "23/08/2025", min_price: "1600", max_price: "2600", modal_price: "2100" },
  { state: "Gujarat", district: "Surat", market: "Songadh", commodity: "Bhindi(Ladies Finger)", variety: "Bhindi", arrival_date: "23/08/2025", min_price: "1860", max_price: "3200", modal_price: "2750" },
  { state: "Haryana", district: "Gurgaon", market: "Gurgaon", commodity: "Potato", variety: "Other", arrival_date: "23/08/2025", min_price: "800", max_price: "1200", modal_price: "1000" },
  { state: "Kerala", district: "Alappuzha", market: "Harippad", commodity: "Banana - Green", variety: "Other", arrival_date: "23/08/2025", min_price: "5000", max_price: "5500", modal_price: "5000" },
  { state: "Punjab", district: "Amritsar", market: "Rayya", commodity: "Onion", variety: "Red", arrival_date: "23/08/2025", min_price: "2000", max_price: "2000", modal_price: "2000" },
  { state: "Punjab", district: "Tarntaran", market: "Tarantaran", commodity: "Potato", variety: "Other", arrival_date: "23/08/2025", min_price: "700", max_price: "800", modal_price: "750" },
  { state: "Punjab", district: "Tarntaran", market: "Tarantaran", commodity: "Tomato", variety: "Other", arrival_date: "23/08/2025", min_price: "3500", max_price: "4500", modal_price: "4000" },
  { state: "Rajasthan", district: "Ganganagar", market: "Sriganganagar (F&V)", commodity: "Green Peas", variety: "Green Peas", arrival_date: "23/08/2025", min_price: "7800", max_price: "8200", modal_price: "8000" },
  { state: "Uttar Pradesh", district: "Bulandshahar", market: "Gulavati", commodity: "Bitter gourd", variety: "Bitter Gourd", arrival_date: "23/08/2025", min_price: "1500", max_price: "1700", modal_price: "1600" },
  { state: "Uttar Pradesh", district: "Shamli", market: "Kairana", commodity: "Onion", variety: "Red", arrival_date: "23/08/2025", min_price: "1200", max_price: "1300", modal_price: "1250" },
  { state: "Uttar Pradesh", district: "Khiri (Lakhimpur)", market: "Maigalganj", commodity: "Wheat", variety: "Dara", arrival_date: "23/08/2025", min_price: "2500", max_price: "2560", modal_price: "2530" },
  { state: "Uttar Pradesh", district: "Khiri (Lakhimpur)", market: "Maigalganj", commodity: "Maize", variety: "Local", arrival_date: "23/08/2025", min_price: "1800", max_price: "1950", modal_price: "1870" },
  { state: "Andhra Pradesh", district: "Guntur", market: "Pidugurala(Palnadu)", commodity: "Dry Chillies", variety: "Red", arrival_date: "23/08/2025", min_price: "12000", max_price: "15000", modal_price: "14500" },
];