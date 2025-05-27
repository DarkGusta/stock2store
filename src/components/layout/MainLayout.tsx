
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { hasPermission } from '@/services/auth/rbacService';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Role-based redirect logic - but only for root path
  useEffect(() => {
    if (!user) return;

    const currentPath = location.pathname;
    
    // Only redirect from root path, don't interfere with other navigation
    if (currentPath === '/' || currentPath === '/stock2store') {
      const roleHomePaths = {
        customer: '/store',
        warehouse: '/warehouse', 
        analyst: '/analytics',
        admin: '/users'
      };

      const userHomeRoute = roleHomePaths[user.role] || '/store';
      console.log(`Redirecting ${user.role} user from ${currentPath} to ${userHomeRoute}`);
      navigate(userHomeRoute, { replace: true });
    }
  }, [user, navigate, location.pathname]);
  
  // Close sidebar when screen size changes to large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar 
        user={user} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        onSignOut={handleSignOut} 
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Header 
          user={user} 
          setSidebarOpen={setSidebarOpen} 
          onSignOut={handleSignOut} 
        />

        {/* Main content */}
        <main className="flex-1 w-full">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
