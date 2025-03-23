// frontend/web-app/src/components/common/PassengerRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PassengerRoute = ({ role }) => {
  return role === 'passenger' ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default PassengerRoute;