// frontend/web-app/src/components/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Notifications from '../common/Notifications';
import LoadingSpinner from '../common/LoadingSpinner';
import socketService from '../../services/socketService';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoading } = useSelector(state => state.auth);
  const { user } = useSelector(state => state.auth);

  // Initialize socket connection when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.initializeSocket(token);
    }

    return () => {
      socketService.disconnectSocket();
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} userRole={user?.role} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Outlet />
          )}
        </main>
        
        <Footer />
      </div>
      
      <Notifications />
    </div>
  );
};

export default Layout;