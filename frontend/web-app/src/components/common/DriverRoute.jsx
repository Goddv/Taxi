// frontend/web-app/src/components/common/DriverRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const DriverRoute = ({ role }) => {
  return role === 'driver' ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default DriverRoute;