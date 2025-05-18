
import React from 'react';
import { Link } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, UserRole } from '@/types';
import UserProfile from './UserProfile';
import SidebarNavigation from './SidebarNavigation';
import { navigationItems } from './navigationConfig';

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
  return (
    <>
      {/* Mobile sidebar overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} 
        onClick={() => setSidebarOpen(false)}
      />
      
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
          <Link to={user.role === 'customer' ? '/store' : '/'} className="flex items-center">
            <span className="text-xl font-semibold text-gray-800">Stock2Store</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        
        <div className="px-4 py-4">
          <UserProfile user={user} />
          <SidebarNavigation navigation={navigationItems} userRole={user.role} />
        </div>
        
        <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
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
