import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { TourListPage } from '../../features/tours/TourListPage';
import { TourDetailPage } from '../../features/tours/TourDetailPage';
import { CheckoutPage } from '../../features/booking/CheckoutPage';
import { BookingTrackingPage } from '../../features/booking/BookingTrackingPage';
import { BookingHistoryPage } from '../../features/booking/BookingHistoryPage';
import { WalletPage } from '../../features/wallet/WalletPage';
import SagaVisualizerPage from '../../features/admin/SagaVisualizerPage';
import UserManagementPage from '../../features/admin/UserManagementPage';
import AdminDashboardOverview from '../../features/admin/AdminDashboardOverview';
import TourOperatorPage from '../../features/operator/TourOperatorPage';
import HotelManagerPage from '../../features/hotel/HotelManagerPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<TourListPage />} />
            <Route path="/tours" element={<TourListPage />} />
            <Route path="/tours/:id" element={<TourDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/tracking/:bookingCode" element={<BookingTrackingPage />} />
            <Route path="/bookings" element={<BookingHistoryPage />} />
            <Route path="/wallet" element={<WalletPage />} />

            {/* Tour Operator Routes */}
            <Route path="/operator" element={<TourOperatorPage />} />
            <Route path="/operator/tours" element={<TourOperatorPage />} />

            {/* Hotel Manager Routes */}
            <Route path="/hotel-manager" element={<HotelManagerPage />} />
            <Route path="/hotel-manager/rooms" element={<HotelManagerPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboardOverview />} />
            <Route path="/admin/dashboard" element={<AdminDashboardOverview />} />
            <Route path="/admin/sagas" element={<SagaVisualizerPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default AppRouter;
