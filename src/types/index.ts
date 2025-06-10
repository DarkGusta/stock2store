
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  location?: string;
  image?: string; // Keep for backward compatibility
  barcode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  orderNumber?: string;
  createdAt?: Date;
  products?: any[]; // Keep for backward compatibility
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export type UserRole = 'customer' | 'admin' | 'warehouse' | 'analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  type: 'in' | 'out';
  reason: string;
  performedBy: string;
  timestamp: Date;
  itemStatus?: string;
  orderStatus?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  serialId?: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  ordersPending: number;
  totalSales: number;
  monthlyRevenue: number[];
}
