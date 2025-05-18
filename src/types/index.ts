
export type UserRole = 'admin' | 'warehouse' | 'customer' | 'analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
}

export interface Location {
  id: string;
  shelfNumber: string;
  slotNumber: string;
  status: boolean; // Changed from string to boolean to match database schema
  capacity?: number;
}

export interface ProductType {
  id: string;
  name: string;
  taxType: number;
  description?: string;
}

export interface Inventory {
  id: string;
  productTypeId: string;
  name: string;
  description?: string;
  quantity: number;
  status: boolean; // Changed from string to boolean to match database schema
  createdAt: Date;
  updatedAt: Date;
}

export interface Price {
  id: string;
  inventoryId: string;
  amount: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  status: boolean;
  createdAt: Date;
}

export interface Item {
  serialId: string;
  inventoryId: string;
  locationId?: string;
  priceId?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  // Adding products and total for the Index.tsx components
  products?: number | { productId: string; quantity: number; priceAtPurchase: number }[]; 
  total?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemSerial: string;
  price: number;
}

export interface DamageReport {
  id: string;
  itemSerial: string;
  reporterId: string;
  description: string;
  photoUrl?: string;
  status: string;
  reportedAt: Date;
}

export interface Transaction {
  id: string;
  itemSerial: string;
  userId: string;
  sourceLocationId?: string;
  destinationLocationId?: string;
  transactionType: string;
  orderId?: string;
  damageReportId?: string;
  notes?: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  ordersPending: number;
  totalSales: number;
  monthlyRevenue: number[];
}

// Add these missing interfaces for components that use them
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  barcode?: string;
  location: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'move';
  quantity: number;
  from?: string;
  to?: string;
  timestamp: Date;
  userId: string;
  userName: string;
  reason: string;
  performedBy: string;
}
