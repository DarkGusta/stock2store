
import {
  LayoutDashboard, Package, Store, BarChart3, 
  Users, Settings, User, ShoppingCart, RotateCcw
} from 'lucide-react';
import { UserRole } from '@/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  allowed: UserRole[];
  resource?: string;
  action?: string;
}

export const navigationItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard, 
    allowed: ['admin', 'warehouse', 'analyst'],
    resource: 'dashboard',
    action: 'view'
  },
  { 
    name: 'Warehouse', 
    href: '/warehouse', 
    icon: Package, 
    allowed: ['admin', 'warehouse', 'analyst'],
    resource: 'warehouse',
    action: 'view'
  },
  { 
    name: 'Store', 
    href: '/store', 
    icon: Store, 
    allowed: ['admin', 'customer', 'analyst'],
    resource: 'store',
    action: 'view'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3, 
    allowed: ['admin', 'analyst'],
    resource: 'analytics',
    action: 'view'
  },
  { 
    name: 'Users', 
    href: '/users', 
    icon: Users, 
    allowed: ['admin'],
    resource: 'users',
    action: 'view'
  },
  { 
    name: 'Shopping Cart', 
    href: '/cart', 
    icon: ShoppingCart, 
    allowed: ['customer'],
    resource: 'cart',
    action: 'view'
  },
  { 
    name: 'Returns', 
    href: '/returns', 
    icon: RotateCcw, 
    allowed: ['customer'],
    resource: 'returns',
    action: 'manage'
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: User, 
    allowed: ['admin', 'warehouse', 'analyst', 'customer'],
    resource: 'profile',
    action: 'view'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings, 
    allowed: ['admin', 'warehouse', 'analyst', 'customer'],
    resource: 'settings',
    action: 'view'
  },
];
