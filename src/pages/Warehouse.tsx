import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertTriangle, TrendingUp, BarChart3, Search, Filter } from 'lucide-react';
import WarehouseOverview from '@/components/warehouse/WarehouseOverview';
import AnalyticsCard from '@/components/warehouse/AnalyticsCard';
import LowStockAlert from '@/components/warehouse/LowStockAlert';
import InventoryMovementsTable from '@/components/warehouse/InventoryMovementsTable';
import ShelfMapping from '@/components/warehouse/ShelfMapping';
import { getProducts } from '@/services';
import { useQuery } from '@tanstack/react-query';

const Warehouse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['warehouse-products'],
    queryFn: getProducts,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const filteredProducts = products?.filter(product =>
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
        <Button>
          <Package size={16} className="mr-2" />
          Add New Product
        </Button>
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
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            {/* Add more categories as needed */}
          </select>
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="shelf">Shelf Mapping</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <WarehouseOverview />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnalyticsCard title="Total Products" value="345" icon={Package} />
            <AnalyticsCard title="Low Stock Items" value="12" icon={AlertTriangle} />
            <AnalyticsCard title="Inventory Turnover" value="7.2" icon={TrendingUp} />
            <AnalyticsCard title="Category Distribution" value="65%" icon={BarChart3} />
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts?.map(product => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Category: {product.category}</p>
                  <p>Stock: {product.stock}</p>
                  <Badge variant="secondary">
                    {product.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="movements" className="space-y-4">
          <InventoryMovementsTable />
        </TabsContent>
        
        <TabsContent value="shelf" className="space-y-4">
          <ShelfMapping />
        </TabsContent>
      </Tabs>

      {/* Low Stock Alerts */}
      <LowStockAlert />
    </div>
  );
};

export default Warehouse;
