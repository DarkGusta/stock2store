
import {
  LayoutDashboard, Package, Store, BarChart3, 
  Users, Settings, User, ShoppingCart, RotateCcw
} from 'lucide-react';
import { UserRole } from '@/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[]; // Changed from 'allowed' to 'roles' for clarity
  resource?: string;
  action?: string;
}

// Define navigation items with their allowed roles
export const navigationItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard, 
    roles: ['admin', 'warehouse', 'analyst'],
    resource: 'dashboard',
    action: 'view'
  },
  { 
    name: 'Warehouse', 
    href: '/warehouse', 
    icon: Package, 
    roles: ['admin', 'warehouse'],
    resource: 'warehouse',
    action: 'view'
  },
  { 
    name: 'Store', 
    href: '/store', 
    icon: Store, 
    roles: ['admin', 'customer', 'analyst', 'warehouse'],
    resource: 'store',
    action: 'view'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3, 
    roles: ['admin', 'analyst'],
    resource: 'analytics',
    action: 'view'
  },
  { 
    name: 'Users', 
    href: '/users', 
    icon: Users, 
    roles: ['admin'],
    resource: 'users',
    action: 'view'
  },
  { 
    name: 'Shopping Cart', 
    href: '/cart', 
    icon: ShoppingCart, 
    roles: ['customer', 'admin', 'analyst'],
    resource: 'cart',
    action: 'view'
  },
  { 
    name: 'Returns', 
    href: '/returns', 
    icon: RotateCcw, 
    roles: ['customer', 'admin', 'analyst'],
    resource: 'returns',
    action: 'manage'
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: User, 
    roles: ['admin', 'warehouse', 'analyst', 'customer'],
    resource: 'profile',
    action: 'view'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings, 
    roles: ['admin', 'warehouse', 'analyst', 'customer'],
    resource: 'settings',
    action: 'view'
  },
];

// Helper function to filter navigation items by role
export function getNavigationByRole(role: UserRole): NavItem[] {
  return navigationItems.filter(item => item.roles.includes(role));
}
