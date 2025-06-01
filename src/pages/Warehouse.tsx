
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertTriangle, TrendingUp, BarChart3, Search, Filter } from 'lucide-react';
import WarehouseOverview from '@/components/warehouse/WarehouseOverview';
import LowStockAlert from '@/components/warehouse/LowStockAlert';
import InventoryMovementsTable from '@/components/warehouse/InventoryMovementsTable';
import ShelfMapping from '@/components/warehouse/ShelfMapping';
import RefundRequestsTab from '@/components/warehouse/RefundRequestsTab';
import ItemStatusManager from '@/components/inventory/ItemStatusManager';
import AddProductForm from '@/components/warehouse/AddProductForm';
import PendingOrdersTab from '@/components/warehouse/PendingOrdersTab';
import { getProducts } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, InventoryMovement } from '@/types';

const Warehouse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['warehouse-products'],
    queryFn: getProducts,
  });

  // Fetch inventory movements (transactions)
  const { data: inventoryMovements = [] } = useQuery({
    queryKey: ['inventory-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          items!inner (
            serial_id,
            inventory (
              name,
              id
            )
          ),
          profiles!transactions_user_id_fkey (
            name,
            email
          ),
          orders (
            order_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((transaction: any) => ({
        id: transaction.id,
        productId: transaction.items.inventory.id,
        productName: transaction.items.inventory.name,
        quantity: 1, // Each transaction is for one item
        type: transaction.transaction_type === 'sale' ? 'out' : 'in',
        reason: transaction.notes || transaction.transaction_type,
        performedBy: transaction.profiles?.name || 'System',
        timestamp: new Date(transaction.created_at),
        userId: transaction.user_id,
        userName: transaction.profiles?.name || 'Unknown',
        serialId: transaction.item_serial,
        orderNumber: transaction.orders?.order_number
      })) as InventoryMovement[];
    },
  });

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category))];

  const handleProductSelect = (product: Product) => {
    console.log('Product selected:', product);
  };

  const handleViewAllInventory = () => {
    setActiveTab('inventory');
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading warehouse data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading warehouse data: {error.message}
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || product.category === filterCategory)
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Warehouse Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your inventory, track stock levels, and analyze warehouse operations.
          </p>
        </div>
        <AddProductForm existingCategories={categories} />
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="search"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="md:col-span-2 flex items-center space-x-4">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Order Requests</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="refunds">Refund Requests</TabsTrigger>
          <TabsTrigger value="item-status">Item Status</TabsTrigger>
          <TabsTrigger value="shelf">Shelf Mapping</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <WarehouseOverview products={products} inventoryMovements={inventoryMovements} />
          
          {/* Analytics Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.filter(p => p.stock <= 5).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.reduce((sum, p) => sum + p.stock, 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <PendingOrdersTab />
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Category: {product.category}</p>
                  <p>Stock: {product.stock}</p>
                  <p>Location: {product.location || 'A1-01'}</p>
                  <Badge variant={product.stock > 5 ? "default" : "destructive"}>
                    {product.stock > 5 ? 'In Stock' : 'Low Stock'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="movements" className="space-y-4">
          <InventoryMovementsTable movements={inventoryMovements} getProductById={getProductById} />
        </TabsContent>
        
        <TabsContent value="refunds" className="space-y-4">
          <RefundRequestsTab />
        </TabsContent>
        
        <TabsContent value="item-status" className="space-y-4">
          <ItemStatusManager />
        </TabsContent>
        
        <TabsContent value="shelf" className="space-y-4">
          <ShelfMapping products={products} onProductSelect={handleProductSelect} />
        </TabsContent>
      </Tabs>

      {/* Low Stock Alerts */}
      <LowStockAlert 
        products={products} 
        onProductSelect={handleProductSelect} 
        onViewAllInventory={handleViewAllInventory} 
      />
    </div>
  );
};

export default Warehouse;
