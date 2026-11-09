import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { TourListPage } from '../../features/tours/TourListPage';
import { CheckoutPage } from '../../features/booking/CheckoutPage';
import { BookingTrackingPage } from '../../features/booking/BookingTrackingPage';
import { BookingHistoryPage } from '../../features/booking/BookingHistoryPage';
import { WalletPage } from '../../features/wallet/WalletPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<TourListPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/tracking/:bookingCode" element={<BookingTrackingPage />} />
            <Route path="/bookings" element={<BookingHistoryPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
