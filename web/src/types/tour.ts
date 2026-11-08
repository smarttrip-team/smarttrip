export interface Departure {
  id: number;
  tourId: number;
  departureDate: string; // ISO date YYYY-MM-DD
  returnDate: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: string; // "OPEN", "CLOSED", "FULL"
}

export interface Tour {
  id: number;
  destinationId?: number;
  destinationName?: string;
  city: string;
  country: string;
  title: string;
  description: string;
  durationDays: number;
  basePrice: number;
  status: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  highlights?: string[];
  itinerary?: { day: number; title: string; content: string }[];
  upcomingDepartures?: Departure[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface TourSearchParams {
  keyword?: string;
  destinationId?: number | string;
  city?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  page?: number;
  size?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'duration' | 'date';
}
