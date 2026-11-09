import axios from 'axios';

// Base API instance pointing to API Gateway
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token and X-User-Id header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('smarttrip_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const userId = localStorage.getItem('smarttrip_user_id') || '10';
  config.headers['X-User-Id'] = userId;
  return config;
});

// Response interceptor for unified error formatting
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Lỗi kết nối máy chủ';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (credentials) => API.post('/api/v1/auth/login', credentials),
  register: (payload) => API.post('/api/v1/auth/register', payload),
  getProfile: () => API.get('/api/v1/users/me'),
  updateProfile: (payload) => API.put('/api/v1/users/me', payload),
  getUserById: (id) => API.get(`/api/v1/users/${id}`),
};

export const tourApi = {
  getTours: (params) => API.get('/api/v1/tours', { params }),
  getTourById: (id) => API.get(`/api/v1/tours/${id}`),
  getTourDepartures: (id) => API.get(`/api/v1/tours/${id}/departures`),
};

export const operatorApi = {
  createTour: (payload) => API.post('/api/v1/operator/tours', payload),
  addDeparture: (tourId, payload) => API.post(`/api/v1/operator/tours/${tourId}/departures`, payload),
};

export const hotelApi = {
  getHotels: () => API.get('/api/v1/hotels'),
  getHotelById: (id) => API.get(`/api/v1/hotels/${id}`),
  getRoomTypes: (hotelId) => API.get(`/api/v1/hotels/${hotelId}/room-types`),
};

export const walletApi = {
  getWallet: (userId) => API.get(`/api/v1/wallets/user/${userId}`),
  topUp: (payload) => API.post('/api/v1/wallet/top-ups', payload),
  getTransactions: (userId) => API.get(`/api/v1/wallet/transactions?userId=${userId}`),
};

export const bookingApi = {
  createBooking: (payload) => API.post('/api/v1/bookings', payload),
  getBookingByCode: (bookingCode) => API.get(`/api/v1/bookings/${bookingCode}`),
  getSagaStatus: (bookingCode) => API.get(`/api/v1/bookings/${bookingCode}/saga`),
  getCustomerBookings: (customerId) => API.get(`/api/v1/bookings?customerId=${customerId}`),
  cancelBooking: (bookingCode) => API.post(`/api/v1/bookings/${bookingCode}/cancel`),
};

export default API;
