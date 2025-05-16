
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Store, BarChart3, Users, Settings, LogOut, Menu, X, 
  Bell, Search, ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, UserRole } from '@/types';
import { getCurrentUser } from '@/utils/mockData';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  allowed: UserRole[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, allowed: ['admin', 'warehouse', 'analyst', 'customer'] },
  { name: 'Products', href: '/products', icon: Package, allowed: ['admin', 'warehouse', 'analyst'] },
  { name: 'Warehouse', href: '/warehouse', icon: Package, allowed: ['admin', 'warehouse'] },
  { name: 'Store', href: '/store', icon: Store, allowed: ['admin', 'customer', 'analyst'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, allowed: ['admin', 'analyst'] },
  { name: 'Users', href: '/users', icon: Users, allowed: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings, allowed: ['admin', 'warehouse', 'analyst', 'customer'] },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentUser: User = getCurrentUser();

  const filteredNavigation = navigation.filter(item => 
    item.allowed.includes(currentUser.role)
  );
  
  // Function to determine if a nav link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} 
        onClick={() => setSidebarOpen(false)}></div>
      
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-50`}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-semibold text-gray-800">Stock2Store</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3 mb-6">
            <Avatar>
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {filteredNavigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    active 
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`mr-3 ${active ? 'text-blue-700' : 'text-gray-500'}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut size={20} className="mr-2" />
            Log out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm lg:static lg:overflow-y-visible">
          <div className="flex justify-between items-center h-16 px-4 md:px-6">
            <div className="flex items-center">
              <button 
                className="lg:hidden text-gray-500 hover:text-gray-900"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div className="ml-4 flex items-center lg:ml-0">
                <div className="relative md:w-64">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Search..."
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-gray-500">
                <Bell size={20} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full flex items-center justify-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
