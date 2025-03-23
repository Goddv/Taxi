import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken } from './redux/slices/authSlice';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import DriverRoute from './components/common/DriverRoute';
import PassengerRoute from './components/common/PassengerRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import BookingPage from './pages/passenger/BookingPage';
import BookingHistoryPage from './pages/passenger/BookingHistoryPage';
import BookingDetailsPage from './pages/passenger/BookingDetailsPage';
import ProfilePage from './pages/profile/ProfilePage';
import PaymentMethodsPage from './pages/passenger/PaymentMethodsPage';
import WalletPage from './pages/passenger/WalletPage';
import NotificationsPage from './pages/common/NotificationsPage';
import DriverDashboardPage from './pages/driver/DriverDashboardPage';
import DriverBookingsPage from './pages/driver/DriverBookingsPage';
import DriverProfilePage from './pages/driver/DriverProfilePage';
import DriverEarningsPage from './pages/driver/DriverEarningsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminDriversPage from './pages/admin/AdminDriversPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import NotFoundPage from './pages/common/NotFoundPage';
import LandingPage from './pages/landing/LandingPage';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(refreshToken());
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route element={<Layout />}>
          {/* Common routes */}
          <Route path="/dashboard" element={
            user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
            user?.role === 'driver' ? <Navigate to="/driver/dashboard" /> :
            <DashboardPage />
          } />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Passenger routes */}
          <Route element={<PassengerRoute role={user?.role} />}>
            <Route path="/book" element={<BookingPage />} />
            <Route path="/bookings" element={<BookingHistoryPage />} />
            <Route path="/bookings/:id" element={<BookingDetailsPage />} />
            <Route path="/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/wallet" element={<WalletPage />} />
          </Route>

          {/* Driver routes */}
          <Route element={<DriverRoute role={user?.role} />}>
            <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
            <Route path="/driver/bookings" element={<DriverBookingsPage />} />
            <Route path="/driver/profile" element={<DriverProfilePage />} />
            <Route path="/driver/earnings" element={<DriverEarningsPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute role={user?.role} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/drivers" element={<AdminDriversPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
