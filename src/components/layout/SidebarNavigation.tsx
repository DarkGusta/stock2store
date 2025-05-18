
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';

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
  }[];
  userRole: UserRole;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ navigation, userRole }) => {
  const location = useLocation();
  
  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => 
    item.allowed.includes(userRole)
  );
  
  // Function to determine if a nav link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="space-y-1">
      {filteredNavigation.map((item) => (
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
