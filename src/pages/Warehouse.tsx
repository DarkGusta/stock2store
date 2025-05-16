
import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import { products, inventoryMovements } from '@/utils/mockData';
import { Product } from '@/types';
import ShelfMapping from '@/components/warehouse/ShelfMapping';
import WarehouseOverview from '@/components/warehouse/WarehouseOverview';
import LowStockAlert from '@/components/warehouse/LowStockAlert';
import AnalyticsCard from '@/components/warehouse/AnalyticsCard';
import ProductDetail from '@/components/warehouse/ProductDetail';
import InventoryMovementsTable from '@/components/warehouse/InventoryMovementsTable';

const Warehouse = () => {
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Sort products by stock level (low to high)
  const sortedProducts = [...products].sort((a, b) => a.stock - b.stock);
  
  // Sort movements by timestamp (most recent first)
  const sortedMovements = [...inventoryMovements].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  // Helper function
  const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
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
            <WarehouseOverview 
              products={products} 
              inventoryMovements={inventoryMovements} 
            />
            
            <LowStockAlert 
              products={products} 
              onProductSelect={setSelectedProduct}
              onViewAllInventory={() => setActiveTab('inventory')}
            />
            
            <AnalyticsCard />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Product Detail Card (conditional) */}
            {selectedProduct && (
              <ProductDetail 
                product={selectedProduct} 
                onClose={() => setSelectedProduct(null)}
              />
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
                <InventoryMovementsTable 
                  movements={sortedMovements}
                  getProductById={getProductById}
                />
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
