
export type UserRole = 'admin' | 'warehouse' | 'customer' | 'analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  barcode?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  quantity: number;
  type: 'in' | 'out';
  reason: string;
  performedBy: string;
  timestamp: Date;
}

export interface Order {
  id: string;
  customerId: string;
  products: {
    productId: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  ordersPending: number;
  totalSales: number;
  monthlyRevenue: number[];
}
