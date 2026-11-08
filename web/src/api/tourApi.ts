import { apiClient } from './client';
import type { Tour, PageResponse, TourSearchParams } from '../types/tour';
import { MOCK_TOURS } from './mockData';

export const tourApi = {
  searchTours: async (params: TourSearchParams = {}): Promise<PageResponse<Tour>> => {
    try {
      const response = await apiClient.get<PageResponse<Tour>>('/api/v1/tours', {
        params: {
          keyword: params.keyword || undefined,
          destinationId: params.destinationId || undefined,
          minPrice: params.minPrice || undefined,
          maxPrice: params.maxPrice || undefined,
          page: params.page ?? 0,
          size: params.size ?? 9,
        },
      });
      return response.data;
    } catch (error) {
      console.warn('API Gateway tour search failed, falling back to mock dataset:', error);
      // Client-side filtering on mock data
      let filtered = [...MOCK_TOURS];

      if (params.keyword && params.keyword.trim()) {
        const kw = params.keyword.toLowerCase().trim();
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(kw) ||
            t.city.toLowerCase().includes(kw) ||
            (t.destinationName && t.destinationName.toLowerCase().includes(kw)) ||
            t.description.toLowerCase().includes(kw)
        );
      }

      if (params.city && params.city.trim()) {
        filtered = filtered.filter((t) => t.city.toLowerCase() === params.city?.toLowerCase());
      }

      if (params.destinationId) {
        filtered = filtered.filter((t) => t.destinationId === Number(params.destinationId));
      }

      if (params.minPrice) {
        filtered = filtered.filter((t) => t.basePrice >= Number(params.minPrice));
      }

      if (params.maxPrice) {
        filtered = filtered.filter((t) => t.basePrice <= Number(params.maxPrice));
      }

      if (params.sortBy === 'price_asc') {
        filtered.sort((a, b) => a.basePrice - b.basePrice);
      } else if (params.sortBy === 'price_desc') {
        filtered.sort((a, b) => b.basePrice - a.basePrice);
      } else if (params.sortBy === 'duration') {
        filtered.sort((a, b) => a.durationDays - b.durationDays);
      }

      const page = params.page ?? 0;
      const size = params.size ?? 9;
      const start = page * size;
      const paginated = filtered.slice(start, start + size);
      const totalPages = Math.ceil(filtered.length / size) || 1;

      return {
        content: paginated,
        totalElements: filtered.length,
        totalPages,
        size,
        number: page,
        first: page === 0,
        last: page >= totalPages - 1,
        empty: paginated.length === 0,
      };
    }
  },

  getTourById: async (id: number): Promise<Tour> => {
    try {
      const response = await apiClient.get<Tour>(`/api/v1/tours/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`API Gateway tour ${id} fetch failed, falling back to mock dataset:`, error);
      const found = MOCK_TOURS.find((t) => t.id === Number(id));
      if (!found) {
        throw new Error(`Tour with id ${id} not found`);
      }
      return found;
    }
  },

  getFeaturedTours: async (): Promise<Tour[]> => {
    try {
      const response = await apiClient.get<PageResponse<Tour>>('/api/v1/tours', {
        params: { page: 0, size: 4 },
      });
      return response.data.content;
    } catch {
      return MOCK_TOURS.slice(0, 4);
    }
  },
};
