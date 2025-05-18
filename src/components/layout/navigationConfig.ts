
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
}

export const navigationItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, allowed: ['admin', 'warehouse', 'analyst'] },
  { name: 'Products', href: '/products', icon: Package, allowed: ['admin', 'warehouse', 'analyst'] },
  { name: 'Warehouse', href: '/warehouse', icon: Package, allowed: ['admin', 'warehouse'] },
  { name: 'Store', href: '/store', icon: Store, allowed: ['admin', 'customer', 'analyst'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, allowed: ['admin', 'analyst'] },
  { name: 'Users', href: '/users', icon: Users, allowed: ['admin'] },
  { name: 'Shopping Cart', href: '/cart', icon: ShoppingCart, allowed: ['customer'] },
  { name: 'Returns', href: '/returns', icon: RotateCcw, allowed: ['customer'] },
  { name: 'Profile', href: '/profile', icon: User, allowed: ['admin', 'warehouse', 'analyst', 'customer'] },
  { name: 'Settings', href: '/settings', icon: Settings, allowed: ['admin', 'warehouse', 'analyst', 'customer'] },
];
