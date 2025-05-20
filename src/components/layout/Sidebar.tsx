
import React from 'react';
import { Link } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import UserProfile from './UserProfile';
import SidebarNavigation from './SidebarNavigation';

interface SidebarProps {
  user: User;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onSignOut: () => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  sidebarOpen,
  setSidebarOpen,
  onSignOut
}) => {
  // Function to determine home page based on user role
  const getHomeRoute = () => {
    return user.role === 'customer' ? '/store' : '/';
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} 
        onClick={() => setSidebarOpen(false)}
      />
      
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700">
          <Link to={getHomeRoute()} className="flex items-center">
            <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">Stock2Store</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <UserProfile user={user} />
          <SidebarNavigation userRole={user.role} />
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" 
            onClick={onSignOut}
          >
            <LogOut size={20} className="mr-2" />
            Log out
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
