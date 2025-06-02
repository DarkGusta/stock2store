
export type UserRole = 'admin' | 'warehouse' | 'customer' | 'analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  location: string;
  barcode?: string;  // Added barcode field
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;  // Added missing property
  ordersPending: number;
  totalSales: number;
  monthlyRevenue: number[];
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
  userId: string;
  userName: string;
  serialId?: string;  // Added for tracking individual items
  orderNumber?: string;  // Added for linking to orders
  customerName?: string;  // Added for customer information
  customerEmail?: string;  // Added for customer information
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  totalAmount: number;
  total?: number;  // Added for backward compatibility
  products: any[];
  createdAt: string | Date;
  updatedAt?: string | Date;  // Made optional to match existing code
}
