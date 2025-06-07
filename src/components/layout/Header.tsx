
import React from 'react';
import { Menu, Bell, Search, Moon, Sun } from 'lucide-react';
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
import { Link } from 'react-router-dom';
import { User } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  user: User;
  setSidebarOpen: (open: boolean) => void;
  onSignOut: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ user, setSidebarOpen, onSignOut }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 w-full">
      <div className="w-full flex justify-between items-center h-16 px-4 md:px-6">
        <div className="flex items-center flex-1">
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-10 pr-3 text-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search..."
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400">
            <Bell size={20} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-gray-500 dark:text-gray-400"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full flex items-center justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/profile" className="flex w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/settings" className="flex w-full">Settings</Link>
              </DropdownMenuItem>
              {user.role === 'customer' && (
                <>
                  <DropdownMenuItem>
                    <Link to="/cart" className="flex w-full">Shopping Cart</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/returns" className="flex w-full">Returns</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={onSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
