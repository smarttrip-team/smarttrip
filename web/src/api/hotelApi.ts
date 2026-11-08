import { apiClient } from './client';
import type { HotelPackage } from '../types/hotel';
import { MOCK_HOTEL_PACKAGES } from './mockData';

export const hotelApi = {
  getHotelForTour: async (tourId: number): Promise<HotelPackage | null> => {
    try {
      const response = await apiClient.get<HotelPackage>(`/api/v1/hotels/tour/${tourId}`);
      return response.data;
    } catch {
      return MOCK_HOTEL_PACKAGES[tourId] || null;
    }
  },
};
