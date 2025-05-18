
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';
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
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
        active 
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon
        size={20}
        className={`mr-3 ${active ? 'text-blue-700' : 'text-gray-500'}`}
      />
      {name}
    </Link>
  );
};

interface SidebarNavigationProps {
  navigation: {
    name: string;
    href: string;
    icon: React.ElementType;
    allowed: UserRole[];
    resource?: string;
    action?: string;
  }[];
  userRole: UserRole;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ navigation, userRole }) => {
  const location = useLocation();
  const [authorizedNavItems, setAuthorizedNavItems] = useState<typeof navigation>([]);
  
  // Function to determine if a nav link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Use the permissions system to filter navigation items
  useEffect(() => {
    const checkPermissions = async () => {
      const filteredItems = [];
      
      for (const item of navigation) {
        // If the item has resource and action properties, check permissions
        if (item.resource && item.action) {
          const hasAccess = await hasPermission(item.resource, item.action);
          if (hasAccess) {
            filteredItems.push(item);
          }
        } 
        // Fall back to role-based check if no resource/action specified
        else if (item.allowed.includes(userRole)) {
          filteredItems.push(item);
        }
      }
      
      setAuthorizedNavItems(filteredItems);
    };
    
    checkPermissions();
  }, [navigation, userRole]);
  
  return (
    <nav className="space-y-1">
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
