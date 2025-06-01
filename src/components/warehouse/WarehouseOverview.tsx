
import React from 'react';
import { Box, Package, ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, InventoryMovement } from '@/types';

interface WarehouseOverviewProps {
  products: Product[];
  inventoryMovements: InventoryMovement[];
}

const WarehouseOverview: React.FC<WarehouseOverviewProps> = ({ products, inventoryMovements }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Warehouse Overview</CardTitle>
        <CardDescription>Current inventory status and key metrics</CardDescription>
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
  );
};

export default WarehouseOverview;
