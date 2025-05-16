
import { User, Product, InventoryMovement, Order, DashboardStats, UserRole } from '../types';

// Sample Users
export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@stock2store.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=06B6D4&color=fff',
  },
  {
    id: '2',
    name: 'Warehouse Manager',
    email: 'warehouse@stock2store.com',
    role: 'warehouse',
    avatar: 'https://ui-avatars.com/api/?name=Warehouse+Manager&background=0EA5E9&color=fff',
  },
  {
    id: '3',
    name: 'Customer Account',
    email: 'customer@example.com',
    role: 'customer',
    avatar: 'https://ui-avatars.com/api/?name=Customer+Account&background=8B5CF6&color=fff',
  },
  {
    id: '4',
    name: 'Data Analyst',
    email: 'analyst@stock2store.com',
    role: 'analyst',
    avatar: 'https://ui-avatars.com/api/?name=Data+Analyst&background=F97316&color=fff',
  },
];

// Sample Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.',
    price: 129.99,
    stock: 45,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    barcode: 'WBH-12345',
    location: 'Shelf A-12',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-03-20'),
  },
  {
    id: '2',
    name: 'Ergonomic Office Chair',
    description: 'Adjustable office chair with lumbar support and breathable mesh back.',
    price: 249.99,
    stock: 12,
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1505744386214-51dba16a26fc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    barcode: 'EOC-67890',
    location: 'Warehouse B-05',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-04-05'),
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    description: 'Water-resistant smart watch with heart rate monitor and GPS tracking.',
    price: 179.99,
    stock: 28,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    barcode: 'SFW-24680',
    location: 'Shelf A-03',
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-03-15'),
  },
  {
    id: '4',
    name: 'Portable Espresso Maker',
    description: 'Compact manual espresso maker for travel and camping.',
    price: 89.99,
    stock: 3,
    category: 'Kitchen',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    barcode: 'PEM-13579',
    location: 'Shelf C-08',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-04-10'),
  },
  {
    id: '5',
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with multiple brightness levels and color temperatures.',
    price: 59.99,
    stock: 32,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    barcode: 'LDL-97531',
    location: 'Shelf B-11',
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2023-03-28'),
  },
  {
    id: '6',
    name: 'Waterproof Hiking Boots',
    description: 'Durable waterproof hiking boots with excellent grip and ankle support.',
    price: 149.99,
    stock: 19,
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    barcode: 'WHB-86420',
    location: 'Warehouse D-02',
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2023-04-02'),
  },
];

// Sample Inventory Movements
export const inventoryMovements: InventoryMovement[] = [
  {
    id: '1',
    productId: '1',
    quantity: 20,
    type: 'in',
    reason: 'Initial stock',
    performedBy: '2',
    timestamp: new Date('2023-01-15'),
  },
  {
    id: '2',
    productId: '1',
    quantity: 5,
    type: 'out',
    reason: 'Order fulfillment',
    performedBy: '2',
    timestamp: new Date('2023-01-25'),
  },
  {
    id: '3',
    productId: '2',
    quantity: 15,
    type: 'in',
    reason: 'Supplier delivery',
    performedBy: '2',
    timestamp: new Date('2023-02-10'),
  },
  {
    id: '4',
    productId: '3',
    quantity: 3,
    type: 'out',
    reason: 'Defective items return',
    performedBy: '2',
    timestamp: new Date('2023-03-05'),
  },
];

// Sample Orders
export const orders: Order[] = [
  {
    id: '1',
    customerId: '3',
    products: [
      { productId: '1', quantity: 1, priceAtPurchase: 129.99 },
      { productId: '5', quantity: 2, priceAtPurchase: 59.99 },
    ],
    status: 'delivered',
    total: 249.97,
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-15'),
  },
  {
    id: '2',
    customerId: '3',
    products: [
      { productId: '3', quantity: 1, priceAtPurchase: 179.99 },
    ],
    status: 'processing',
    total: 179.99,
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-04-06'),
  },
  {
    id: '3',
    customerId: '3',
    products: [
      { productId: '6', quantity: 1, priceAtPurchase: 149.99 },
      { productId: '4', quantity: 1, priceAtPurchase: 89.99 },
    ],
    status: 'pending',
    total: 239.98,
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-10'),
  },
];

// Sample Dashboard Stats
export const dashboardStats: DashboardStats = {
  totalProducts: products.length,
  totalStock: products.reduce((total, product) => total + product.stock, 0),
  lowStockProducts: products.filter(product => product.stock <= 5).length,
  ordersPending: orders.filter(order => order.status === 'pending' || order.status === 'processing').length,
  totalSales: orders.reduce((total, order) => total + order.total, 0),
  monthlyRevenue: [12500, 15000, 18000, 17500, 21000, 22000, 24500, 25000, 23000, 25500, 27000, 29000],
};

export const getCurrentUser = (): User => {
  // In a real application, this would come from authentication
  // For demo purposes, we'll default to the admin user
  return users[0];
};

export const getUserByRole = (role: UserRole): User | undefined => {
  return users.find(user => user.role === role);
};
