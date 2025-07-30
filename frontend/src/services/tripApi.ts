import apiClient from './api';

export interface TripData {
  tripName: string;
  startPlace: string;
  destinationCountry: string;
  returnCountry: string;
  budget: number;
  currency: string;
  startDate: string;
  endDate: string;
  numberOfPeople: number;
  preferences?: {
    accommodation?: string;
    transportation?: string;
    activities?: string[];
    dietaryRestrictions?: ('none' | 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'gluten-free' | 'lactose-free' | 'nut-free' | 'diabetic')[];
    travelStyle?: string;
  };
  personalNeeds?: {
    accessibilityRequirements?: string;
    medicalNeeds?: string;
    specialRequests?: string;
  };
  status?: 'draft' | 'planning' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
}

// Currency options for dropdown
export const CURRENCY_OPTIONS = [
  // Major currencies
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  
  // Asian currencies
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  
  // Middle Eastern currencies
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م' },
  
  // European currencies
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.' },
  { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr' },
  
  // African currencies
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م' },
  
  // South American currencies
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$' },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.' },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.S' },
  
  // North American currencies
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
  
  // Oceania currencies
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$' },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
  { code: 'WST', name: 'Samoan Tala', symbol: 'T' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT' },
  
  // Other currencies
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'so\'m' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' }
];

// Define the structure of a single checklist item for the frontend
export interface ChecklistItem {
  _id?: string; // MongoDB _id for individual items, optional as it's not present on new items
  item: string;
  checked: boolean;
  type: 'packing' | 'place' | 'restaurant' | 'hotel' | 'activity' | 'custom';
  bookingAction?: string; 
  time?: string; 
  location?: string; 
  description?: string; 
  day?: number; 
  date?: string;
}

// Define the full user checklist structure
export interface UserChecklist {
  items: ChecklistItem[];
  generatedFromAIResponseId?: string; 
  lastModifiedAt: string; 
}

export interface Trip extends TripData {
  _id: string;
  user: string;
  aiResponse?: {
    flightOptions: any[];
    hotelOptions: any[];
    itinerary: any[];
    budgetBreakdown: any;
    recommendations: any;
    userChecklist?: UserChecklist; // Checklist directly embedded in AI response (though `getUserChecklist` fetches it separately too)
  };
  createdAt: string;
  updatedAt: string;
}

export const tripApi = {
  // Create new trip
  createTrip: async (tripData: TripData) => {
    const response = await apiClient.post('/trips', tripData);
    return response.data;
  },

  // Get all user trips
  getUserTrips: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    
    const response = await apiClient.get(`/trips?${params}`);
    return response.data;
  },

  // Get single trip
  getTrip: async (tripId: string) => {
    const response = await apiClient.get(`/trips/${tripId}`);
    return response.data;
  },

  // Update trip
  updateTrip: async (tripId: string, tripData: Partial<TripData>) => {
    const response = await apiClient.put(`/trips/${tripId}`, tripData);
    return response.data;
  },

  // Delete trip
  deleteTrip: async (tripId: string) => {
    const response = await apiClient.delete(`/trips/${tripId}`);
    return response.data;
  },

  // Regenerate trip plan
  regenerateTrip: async (tripId: string) => {
    const response = await apiClient.post(`/trips/${tripId}/regenerate`);
    return response.data;
  },

  // Activate draft trip
  activateTrip: async (tripId: string) => {
    const response = await apiClient.post(`/trips/${tripId}/activate`);
    return response.data;
  },

  // Checklist management endpoints
  generateUserChecklist: async (tripId: string) => {
    const response = await apiClient.post(`/trips/${tripId}/checklist/generate`);
    return response.data;
  },

  getUserChecklist: async (tripId: string) => {
    const response = await apiClient.get(`/trips/${tripId}/checklist`);
    return response.data;
  },

  updateChecklistItem: async (tripId: string, itemId: string, updateData: Partial<ChecklistItem>) => {
    const response = await apiClient.put(`/trips/${tripId}/checklist/items/${itemId}`, updateData);
    return response.data;
  },

  addChecklistItem: async (tripId: string, newItemData: Omit<ChecklistItem, '_id'>) => {
    const response = await apiClient.post(`/trips/${tripId}/checklist/items`, newItemData);
    return response.data;
  },

  deleteChecklistItem: async (tripId: string, itemId: string) => {
    const response = await apiClient.delete(`/trips/${tripId}/checklist/items/${itemId}`);
    return response.data;
  },
};