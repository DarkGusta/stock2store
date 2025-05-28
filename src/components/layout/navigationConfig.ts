
import {
  LayoutDashboard, Package, Store, BarChart3, 
  Users, Settings, User, ShoppingCart, RotateCcw, ListOrdered
} from 'lucide-react';
import { UserRole } from '@/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

// Define navigation items with their allowed roles
export const navigationItems: NavItem[] = [
  { 
    name: 'Warehouse', 
    href: '/warehouse', 
    icon: Package, 
    roles: ['admin', 'warehouse']
  },
  { 
    name: 'Store', 
    href: '/store', 
    icon: Store, 
    roles: ['admin', 'customer', 'analyst', 'warehouse']
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3, 
    roles: ['admin', 'analyst']
  },
  { 
    name: 'Users', 
    href: '/users', 
    icon: Users, 
    roles: ['admin']
  },
  { 
    name: 'Shopping Cart', 
    href: '/cart', 
    icon: ShoppingCart, 
    roles: ['customer', 'admin']
  },
  { 
    name: 'Orders', 
    href: '/orders', 
    icon: ListOrdered, 
    roles: ['customer', 'admin']
  },
  { 
    name: 'Returns', 
    href: '/returns', 
    icon: RotateCcw, 
    roles: ['customer', 'admin']
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: User, 
    roles: ['admin', 'warehouse', 'analyst', 'customer']
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings, 
    roles: ['admin', 'warehouse', 'analyst', 'customer']
  },
];

// Helper function to filter navigation items by role
export function getNavigationByRole(role: UserRole): NavItem[] {
  return navigationItems.filter(item => item.roles.includes(role));
}
