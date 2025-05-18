
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  
  if (!user) {
    return <div>Loading...</div>;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        user={user} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        onSignOut={handleSignOut} 
      />

      {/* Main content */}
      <div className="lg:pl-64">
        <Header 
          user={user} 
          setSidebarOpen={setSidebarOpen} 
          onSignOut={handleSignOut} 
        />

        {/* Main content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
