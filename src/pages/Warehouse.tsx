import React, { useState } from 'react';
import { Package, ArrowUp, ArrowDown, Calendar, Clock, User, Box, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import { products, inventoryMovements } from '@/utils/mockData';
import { formatDistanceToNow } from 'date-fns';
import { Product } from '@/types';
import ShelfMapping from '@/components/warehouse/ShelfMapping';

const Warehouse = () => {
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Sort products by stock level (low to high)
  const sortedProducts = [...products].sort((a, b) => a.stock - b.stock);
  
  // Sort movements by timestamp (most recent first)
  const sortedMovements = [...inventoryMovements].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  // Get just the 5 products with lowest stock
  const lowStockProducts = sortedProducts.filter(p => p.stock <= 10).slice(0, 5);

  // Helper functions
  const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const formatDate = (date: Date): string => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Warehouse</h1>
            <p className="text-gray-500">Manage inventory and warehouse operations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <ArrowDown className="mr-2 h-4 w-4" />
              Record Entry
            </Button>
            <Button>
              <ArrowUp className="mr-2 h-4 w-4" />
              Record Exit
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with Stats */}
          <div className="space-y-6">
            {/* Warehouse Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Overview</CardTitle>
                <CardDescription>Current inventory status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <Box size={20} className="text-blue-600" />
                    </div>
                    <span className="ml-2 text-sm">Total Products</span>
                  </div>
                  <span className="font-semibold">{products.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-md">
                      <Package size={20} className="text-green-600" />
                    </div>
                    <span className="ml-2 text-sm">Total Inventory</span>
                  </div>
                  <span className="font-semibold">{products.reduce((sum, p) => sum + p.stock, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-md">
                      <ArrowDown size={20} className="text-red-600" />
                    </div>
                    <span className="ml-2 text-sm">Low Stock Items</span>
                  </div>
                  <span className="font-semibold">{products.filter(p => p.stock <= 5).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-md">
                      <ArrowUp size={20} className="text-yellow-600" />
                    </div>
                    <span className="ml-2 text-sm">Movements Today</span>
                  </div>
                  <span className="font-semibold">
                    {inventoryMovements.filter(m => {
                      const today = new Date();
                      const movementDate = new Date(m.timestamp);
                      return movementDate.toDateString() === today.toDateString();
                    }).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Products */}
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alert</CardTitle>
                <CardDescription>Products that need reordering</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lowStockProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between border-b pb-3 last:border-0 cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden mr-3">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package size={16} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">Location: {product.location}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={product.stock === 0 ? "destructive" : "outline"} 
                      className="ml-2"
                    >
                      {product.stock} left
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setActiveTab('inventory')}>
                  View All Inventory
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 space-y-2">
                  <BarChart3 size={40} className="mx-auto text-gray-400" />
                  <p className="text-gray-500">Advanced inventory analytics</p>
                  <Button variant="outline" size="sm">Open Analytics</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Product Detail Card (conditional) */}
            {selectedProduct && (
              <Card>
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{selectedProduct.name}</CardTitle>
                    <CardDescription>Product Detail</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500"
                    onClick={() => setSelectedProduct(null)}
                  >
                    &times;
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="bg-gray-100 rounded-md mb-3 h-48 flex items-center justify-center">
                        {selectedProduct.image ? (
                          <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.name} 
                            className="object-contain max-h-full"
                          />
                        ) : (
                          <Package size={48} className="text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{selectedProduct.description}</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-semibold">${selectedProduct.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Stock Level</p>
                        <p className="font-semibold">{selectedProduct.stock} units</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Barcode</p>
                        <p className="font-mono">{selectedProduct.barcode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{selectedProduct.location}</p>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button size="sm" variant="outline">
                          <ArrowDown size={16} className="mr-2" />
                          Stock In
                        </Button>
                        <Button size="sm" variant="outline">
                          <ArrowUp size={16} className="mr-2" />
                          Stock Out
                        </Button>
                        <Button size="sm">
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs for Inventory and Movements */}
            <Tabs 
              defaultValue="inventory" 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="movements">Movements</TabsTrigger>
                <TabsTrigger value="shelf-map">Shelf Map</TabsTrigger>
              </TabsList>
              
              <TabsContent value="inventory" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product}
                      onSelect={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="movements">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Movements</CardTitle>
                    <CardDescription>Recent stock entries and exits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Type</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedMovements.map(movement => {
                          const product = getProductById(movement.productId);
                          return (
                            <TableRow key={movement.id}>
                              <TableCell>
                                <Badge 
                                  variant={movement.type === 'in' ? 'default' : 'outline'}
                                  className={movement.type === 'in' ? 'bg-green-500' : 'text-red-500 border-red-500'}
                                >
                                  {movement.type === 'in' ? (
                                    <ArrowDown size={12} className="mr-1" />
                                  ) : (
                                    <ArrowUp size={12} className="mr-1" />
                                  )}
                                  {movement.type === 'in' ? 'Entry' : 'Exit'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {product?.name || 'Unknown Product'}
                              </TableCell>
                              <TableCell>{movement.quantity}</TableCell>
                              <TableCell>{movement.reason}</TableCell>
                              <TableCell className="text-gray-500 text-sm">
                                {formatDate(movement.timestamp)}
                              </TableCell>
                              <TableCell className="text-gray-500 text-sm">
                                Warehouse Staff
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shelf-map">
                <ShelfMapping 
                  products={products} 
                  onProductSelect={setSelectedProduct}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Warehouse;
