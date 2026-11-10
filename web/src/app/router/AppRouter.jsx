import React, { useEffect } from 'react';
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
import { useAuthWallet } from '../../context/AuthWalletContext';

// Protected Route Guard with RBAC authorization
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, currentRole, showToast } = useAuthWallet();

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập với tài khoản phù hợp để truy cập trang này!', 'error');
    } else if (allowedRoles && !allowedRoles.includes(currentRole)) {
      showToast('Bạn không có quyền truy cập trang quản trị này (403 Forbidden)!', 'error');
    }
  }, [isAuthenticated, currentRole, allowedRoles, showToast]);

  if (!isAuthenticated) {
    return <Navigate to="/tours" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/tours" replace />;
  }

  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Customer & Public Routes */}
            <Route path="/" element={<TourListPage />} />
            <Route path="/tours" element={<TourListPage />} />
            <Route path="/tours/:id" element={<TourDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/tracking/:bookingCode" element={<BookingTrackingPage />} />
            
            {/* Authenticated Customer Routes */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                  <BookingHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                  <WalletPage />
                </ProtectedRoute>
              }
            />

            {/* Tour Operator Protected Routes */}
            <Route
              path="/operator"
              element={
                <ProtectedRoute allowedRoles={['ROLE_TOUR_OPERATOR', 'ROLE_ADMIN']}>
                  <TourOperatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/tours"
              element={
                <ProtectedRoute allowedRoles={['ROLE_TOUR_OPERATOR', 'ROLE_ADMIN']}>
                  <TourOperatorPage />
                </ProtectedRoute>
              }
            />

            {/* Hotel Manager Protected Routes */}
            <Route
              path="/hotel-manager"
              element={
                <ProtectedRoute allowedRoles={['ROLE_HOTEL_MANAGER', 'ROLE_ADMIN']}>
                  <HotelManagerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hotel-manager/rooms"
              element={
                <ProtectedRoute allowedRoles={['ROLE_HOTEL_MANAGER', 'ROLE_ADMIN']}>
                  <HotelManagerPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminDashboardOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminDashboardOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sagas"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <SagaVisualizerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />

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
