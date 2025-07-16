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
    dietaryRestrictions?: string[];
    travelStyle?: string;
  };
  personalNeeds?: {
    accessibilityRequirements?: string;
    medicalNeeds?: string;
    specialRequests?: string;
  };
  status?: 'draft' | 'active' | 'planning';
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
  }
};
