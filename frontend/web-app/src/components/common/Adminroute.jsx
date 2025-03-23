// frontend/web-app/src/components/common/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({ role }) => {
  return role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default AdminRoute;