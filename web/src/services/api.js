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

export const tourApi = {
  getTours: () => API.get('/api/v1/tours'),
  getTourById: (id) => API.get(`/api/v1/tours/${id}`),
  getTourDepartures: (id) => API.get(`/api/v1/tours/${id}/departures`),
};

export const operatorApi = {
  createTour: (data) => API.post('/api/v1/operator/tours', data),
  addDeparture: (tourId, data) => API.post(`/api/v1/operator/tours/${tourId}/departures`, data),
  updateCapacity: (depId, totalSeats, availableSeats) => {
    const params = new URLSearchParams();
    if (totalSeats !== undefined && totalSeats !== null) params.append('totalSeats', totalSeats);
    if (availableSeats !== undefined && availableSeats !== null) params.append('availableSeats', availableSeats);
    return API.patch(`/api/v1/operator/tours/departures/${depId}/capacity?${params.toString()}`);
  },
};

export const hotelApi = {
  getHotels: (location) => API.get(`/api/v1/hotels${location ? `?location=${encodeURIComponent(location)}` : ''}`),
  getHotelById: (id) => API.get(`/api/v1/hotels/${id}`),
  checkAvailability: (id, checkIn, checkOut, roomTypeId) => {
    const params = new URLSearchParams({ checkIn, checkOut });
    if (roomTypeId) params.append('roomTypeId', roomTypeId);
    return API.get(`/api/v1/hotels/${id}/availability?${params.toString()}`);
  },
};

export const hotelManagerApi = {
  createHotel: (data) => API.post('/api/v1/manager/hotels', data),
  updateHotel: (id, data) => API.put(`/api/v1/manager/hotels/${id}`, data),
  addRoomType: (hotelId, data) => API.post(`/api/v1/manager/hotels/${hotelId}/room-types`, data),
  updateInventory: (roomTypeId, data) => API.post(`/api/v1/manager/room-types/${roomTypeId}/inventory`, data),
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

export const adminApi = {
  getUsers: () => API.get('/api/v1/users'),
  getUserById: (id) => API.get(`/api/v1/users/${id}`),
  updateUserStatus: (userId, status) => API.patch(`/api/v1/users/${userId}/status?status=${status}`),
  getAllSagas: () => API.get('/api/v1/bookings/sagas'),
};

export default API;
