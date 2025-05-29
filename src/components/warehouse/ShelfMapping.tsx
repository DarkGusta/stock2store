
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, Wrench, Ban } from 'lucide-react';
import { Product } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ShelfMappingProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

interface ItemStatus {
  available: number;
  sold: number;
  damaged: number;
  in_repair: number;
  unavailable: number;
}

interface ProductWithItems extends Product {
  itemStatuses: ItemStatus;
}

const ShelfMapping: React.FC<ShelfMappingProps> = ({ products, onProductSelect }) => {
  const [selectedShelf, setSelectedShelf] = useState<string>('A');

  // Fetch detailed item information for each product
  const { data: detailedProducts = [], isLoading } = useQuery({
    queryKey: ['detailed-products', products],
    queryFn: async () => {
      if (products.length === 0) return [];

      const { data: itemsData, error } = await supabase
        .from('items')
        .select(`
          serial_id,
          status,
          inventory_id,
          inventory (
            id,
            name,
            description,
            quantity
          )
        `);

      if (error) throw error;

      // Group items by inventory_id and count statuses
      const inventoryMap = new Map<string, ItemStatus>();
      
      itemsData?.forEach((item: any) => {
        const inventoryId = item.inventory_id;
        if (!inventoryMap.has(inventoryId)) {
          inventoryMap.set(inventoryId, {
            available: 0,
            sold: 0,
            damaged: 0,
            in_repair: 0,
            unavailable: 0
          });
        }
        
        const statuses = inventoryMap.get(inventoryId)!;
        statuses[item.status as keyof ItemStatus]++;
      });

      // Map products with their item statuses
      return products.map(product => ({
        ...product,
        itemStatuses: inventoryMap.get(product.id) || {
          available: 0,
          sold: 0,
          damaged: 0,
          in_repair: 0,
          unavailable: 0
        }
      })) as ProductWithItems[];
    },
    enabled: products.length > 0
  });

  // Create shelf layout - simulate a warehouse with shelves A, B, C, D
  const shelves = ['A', 'B', 'C', 'D'];
  const slotsPerShelf = 12; // 3x4 grid per shelf

  // Distribute products across shelves
  const getProductsForShelf = (shelf: string) => {
    const shelfIndex = shelves.indexOf(shelf);
    const startIndex = shelfIndex * Math.ceil(detailedProducts.length / shelves.length);
    const endIndex = startIndex + Math.ceil(detailedProducts.length / shelves.length);
    return detailedProducts.slice(startIndex, endIndex);
  };

  const getStatusIcon = (status: keyof ItemStatus) => {
    switch (status) {
      case 'available':
        return <Package className="h-3 w-3 text-green-600" />;
      case 'damaged':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'in_repair':
        return <Wrench className="h-3 w-3 text-yellow-600" />;
      case 'unavailable':
        return <Ban className="h-3 w-3 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTotalItems = (product: ProductWithItems) => {
    return Object.values(product.itemStatuses).reduce((sum, count) => sum + count, 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shelf Mapping</CardTitle>
          <CardDescription>Loading shelf layout...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Warehouse Shelf Mapping</CardTitle>
        <CardDescription>
          Top-down view of warehouse shelves and product locations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shelf Selection */}
        <div className="flex gap-2">
          {shelves.map((shelf) => (
            <Button
              key={shelf}
              variant={selectedShelf === shelf ? 'default' : 'outline'}
              onClick={() => setSelectedShelf(shelf)}
              className="min-w-[60px]"
            >
              Shelf {shelf}
            </Button>
          ))}
        </div>

        {/* Shelf Layout */}
        <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Shelf {selectedShelf}</h3>
            <p className="text-sm text-gray-600">3 rows × 4 columns</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
            {Array.from({ length: slotsPerShelf }, (_, index) => {
              const shelfProducts = getProductsForShelf(selectedShelf);
              const product = shelfProducts[index];
              const slotNumber = `${selectedShelf}${Math.floor(index / 4) + 1}-${(index % 4) + 1}`;
              
              return (
                <div
                  key={index}
                  className={`
                    border-2 rounded-lg p-3 h-32 flex flex-col justify-between
                    ${product 
                      ? 'border-blue-300 bg-blue-50 cursor-pointer hover:bg-blue-100' 
                      : 'border-gray-200 bg-white'
                    }
                  `}
                  onClick={() => product && onProductSelect(product)}
                >
                  <div className="text-xs font-mono text-gray-500 text-center">
                    {slotNumber}
                  </div>
                  
                  {product ? (
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Total: {getTotalItems(product)}
                        </p>
                        
                        {/* Item status indicators */}
                        <div className="flex justify-center gap-1 mt-2 flex-wrap">
                          {Object.entries(product.itemStatuses).map(([status, count]) => (
                            count > 0 && (
                              <div key={status} className="flex items-center gap-1">
                                {getStatusIcon(status as keyof ItemStatus)}
                                <span className="text-xs">{count}</span>
                              </div>
                            )
                          ))}
                        </div>
                        
                        {/* Stock status badge */}
                        <Badge 
                          variant="outline" 
                          className={`mt-2 text-xs ${
                            product.itemStatuses.available === 0 
                              ? 'border-red-300 text-red-700' 
                              : product.itemStatuses.available <= 5
                              ? 'border-yellow-300 text-yellow-700'
                              : 'border-green-300 text-green-700'
                          }`}
                        >
                          {product.itemStatuses.available > 0 
                            ? `${product.itemStatuses.available} Available`
                            : 'Out of Stock'
                          }
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-gray-400 text-center">
                        <Package className="h-6 w-6 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">Empty</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-3">Status Legend</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>Damaged</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-yellow-600" />
              <span>In Repair</span>
            </div>
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-gray-600" />
              <span>Unavailable</span>
            </div>
          </div>
        </div>

        {detailedProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No products found for shelf mapping.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShelfMapping;
