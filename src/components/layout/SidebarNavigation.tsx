
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';
import { getNavigationByRole } from './navigationConfig';
import { hasPermission } from '@/services/auth/rbacService';

interface NavItemProps {
  name: string;
  href: string;
  icon: React.ElementType;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ name, href, icon: Icon, active }) => {
  return (
    <Link
      to={href}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon
        size={20}
        className={`mr-3 ${active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
      />
      {name}
    </Link>
  );
};

interface SidebarNavigationProps {
  userRole: UserRole;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ userRole }) => {
  const location = useLocation();
  const [authorizedNavItems, setAuthorizedNavItems] = useState<ReturnType<typeof getNavigationByRole>>([]);
  
  // Function to determine if a nav link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Get navigation items based on user role and check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      // Get navigation items based on user role
      const roleBasedItems = getNavigationByRole(userRole);
      const filteredItems = [];
      
      for (const item of roleBasedItems) {
        // If the item has resource and action properties, check permissions
        if (item.resource && item.action) {
          const hasAccess = await hasPermission(item.resource, item.action);
          if (hasAccess) {
            filteredItems.push(item);
          }
        } 
        // If no resource/action specified, include by default
        else {
          filteredItems.push(item);
        }
      }
      
      setAuthorizedNavItems(filteredItems);
    };
    
    checkPermissions();
  }, [userRole]);
  
  if (authorizedNavItems.length === 0) {
    return (
      <div className="py-4 text-sm text-gray-500 dark:text-gray-400">
        Loading navigation...
      </div>
    );
  }
  
  return (
    <nav className="space-y-1 mt-4">
      {authorizedNavItems.map((item) => (
        <NavItem
          key={item.name}
          name={item.name}
          href={item.href}
          icon={item.icon}
          active={isActive(item.href)}
        />
      ))}
    </nav>
  );
};

export default SidebarNavigation;
