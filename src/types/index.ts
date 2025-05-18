export type UserRole = 'admin' | 'warehouse' | 'customer' | 'analyst';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  ordersPending: number;
  totalSales: number;
  monthlyRevenue: number[];
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  totalAmount: number;
  products: number | any[];
  createdAt: string | Date;
}
