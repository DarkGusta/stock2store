
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, Wrench, Ban, Move } from 'lucide-react';
import { Product } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  items: Array<{
    serial_id: string;
    status: string;
    location_id: string | null;
    location?: {
      shelf_number: string;
      slot_number: string;
    };
  }>;
}

const ShelfMapping: React.FC<ShelfMappingProps> = ({ products, onProductSelect }) => {
  const [selectedShelf, setSelectedShelf] = useState<string>('A');
  const [draggedProduct, setDraggedProduct] = useState<{
    productId: string;
    product_name: string;
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
          location_id,
          inventory!inner (
            id,
            name,
            description,
            quantity
          ),
          locations (
            shelf_number,
            slot_number
          )
        `);

      if (error) {
        console.error('Error fetching items:', error);
        throw error;
      }

      console.log('Raw items data:', itemsData);

      // Group items by inventory_id and count statuses
      const inventoryMap = new Map<string, ProductWithItems>();
      
      itemsData?.forEach((item: any) => {
        const inventoryId = item.inventory_id;
        const inventoryData = item.inventory;
        
        if (!inventoryMap.has(inventoryId)) {
          // Find the original product to get all required properties
          const originalProduct = products.find(p => p.id === inventoryId);
          
          inventoryMap.set(inventoryId, {
            id: inventoryId,
            name: inventoryData.name,
            description: inventoryData.description || '',
            category: originalProduct?.category || 'Unknown',
            stock: inventoryData.quantity,
            location: originalProduct?.location || '',
            price: originalProduct?.price || 0,
            images: originalProduct?.images || [],
            createdAt: originalProduct?.createdAt || new Date(),
            updatedAt: originalProduct?.updatedAt || new Date(),
            itemStatuses: {
              available: 0,
              sold: 0,
              damaged: 0,
              in_repair: 0,
              unavailable: 0
            },
            items: []
          });
        }
        
        const productData = inventoryMap.get(inventoryId);
        if (productData) {
          productData.itemStatuses[item.status as keyof ItemStatus]++;
          productData.items.push({
            serial_id: item.serial_id,
            status: item.status,
            location_id: item.location_id,
            location: item.locations
          });
        }
      });

      const result = Array.from(inventoryMap.values());
      console.log('Processed detailed products:', result);
      return result;
    },
    enabled: products.length > 0
  });

  // Create shelf layout - simulate a warehouse with shelves A, B, C, D
  const shelves = ['A', 'B', 'C', 'D'];
  const slotsPerShelf = 12; // 3x4 grid per shelf

  // Get products for a specific shelf (group by product, not individual items)
  const getProductsForShelf = (shelf: string) => {
    const shelfProducts: Array<{
      product: ProductWithItems;
      slotPosition: number;
      itemCount: number;
    }> = [];

    detailedProducts.forEach(product => {
      // Find if any items of this product are on this shelf
      const itemsOnShelf = product.items.filter(item => 
        item.location?.shelf_number === shelf
      );

      if (itemsOnShelf.length > 0) {
        // Use the first item's location to determine slot position
        const firstItem = itemsOnShelf[0];
        if (firstItem.location) {
          const [row, slot] = firstItem.location.slot_number.split('-');
          const slotPosition = (parseInt(row) - 1) * 4 + parseInt(slot) - 1;
          
          shelfProducts.push({ 
            product, 
            slotPosition, 
            itemCount: itemsOnShelf.length 
          });
        }
      }
    });

    return shelfProducts;
  };

  const handleDragStart = (e: React.DragEvent, product: ProductWithItems) => {
    setDraggedProduct({
      productId: product.id,
      product_name: product.name
    });
    e.dataTransfer.setData('text/plain', product.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetShelf: string, targetSlot: number) => {
    e.preventDefault();
    
    if (!draggedProduct) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate target location
      const row = Math.floor(targetSlot / 4) + 1;
      const slot = (targetSlot % 4) + 1;
      const targetLocationString = `${targetShelf}${row}-${slot.toString().padStart(2, '0')}`;

      // Check if target location already exists
      let { data: targetLocation } = await supabase
        .from('locations')
        .select('id')
        .eq('shelf_number', targetShelf)
        .eq('slot_number', `${row}-${slot.toString().padStart(2, '0')}`)
        .single();

      // Create location if it doesn't exist
      if (!targetLocation) {
        const { data: newLocation, error: locationError } = await supabase
          .from('locations')
          .insert({
            shelf_number: targetShelf,
            slot_number: `${row}-${slot.toString().padStart(2, '0')}`,
            capacity: 100, // Set higher capacity for multiple items
            status: true
          })
          .select('id')
          .single();

        if (locationError) throw locationError;
        targetLocation = newLocation;
      }

      // Get all items for this product
      const { data: productItems, error: itemsError } = await supabase
        .from('items')
        .select('serial_id, location_id, locations(shelf_number, slot_number)')
        .eq('inventory_id', draggedProduct.productId);

      if (itemsError) throw itemsError;

      if (!productItems || productItems.length === 0) {
        toast({
          title: 'No Items Found',
          description: `No items found for product ${draggedProduct.product_name}`,
          variant: 'destructive',
        });
        return;
      }

      // Get current location for transaction logging
      const oldLocation = productItems[0]?.locations 
        ? `${productItems[0].locations.shelf_number}${productItems[0].locations.slot_number}`
        : 'Unassigned';

      // Update all items of this product to the new location
      const serialIds = productItems.map(item => item.serial_id);
      const { error: updateError } = await supabase
        .from('items')
        .update({ location_id: targetLocation.id })
        .in('serial_id', serialIds);

      if (updateError) throw updateError;

      // Create transaction records for the location change
      const transactionRecords = serialIds.map(serialId => ({
        item_serial: serialId,
        user_id: user.id,
        transaction_type: 'location_change',
        notes: `Product ${draggedProduct.product_name} moved from ${oldLocation} to ${targetLocationString}`,
        source_location_id: productItems.find(item => item.serial_id === serialId)?.location_id,
        destination_location_id: targetLocation.id
      }));

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionRecords);

      if (transactionError) throw transactionError;

      toast({
        title: 'Product Location Updated',
        description: `All ${serialIds.length} items of ${draggedProduct.product_name} moved to ${targetLocationString}`,
      });

      // Refresh data to update the display
      await queryClient.invalidateQueries({ queryKey: ['detailed-products'] });
      await queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });

    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update location',
        variant: 'destructive',
      });
    } finally {
      setDraggedProduct(null);
    }
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

  if (isLoading) {
    return (
      <Card className="bg-card dark:bg-card border-border dark:border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Shelf Mapping</CardTitle>
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

  const shelfProducts = getProductsForShelf(selectedShelf);

  return (
    <Card className="bg-card dark:bg-card border-border dark:border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Move className="h-5 w-5" />
          Warehouse Shelf Mapping
        </CardTitle>
        <CardDescription>
          Drag and drop products to change their location. All items of a product move together.
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
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-800/30">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Shelf {selectedShelf}</h3>
            <p className="text-sm text-muted-foreground">3 rows × 4 columns (drag products to move all items together)</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
            {Array.from({ length: slotsPerShelf }, (_, index) => {
              const row = Math.floor(index / 4) + 1;
              const slot = (index % 4) + 1;
              const slotNumber = `${selectedShelf}${row}-${slot.toString().padStart(2, '0')}`;
              
              // Find product in this slot
              const productInSlot = shelfProducts.find(shelfProduct => shelfProduct.slotPosition === index);
              
              return (
                <div
                  key={index}
                  className={`
                    border-2 rounded-lg p-3 h-32 flex flex-col justify-between transition-colors
                    ${productInSlot 
                      ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 cursor-move' 
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/30 border-dashed'
                    }
                    ${draggedProduct ? 'hover:border-green-400 hover:bg-green-50 dark:hover:border-green-500 dark:hover:bg-green-900/20' : ''}
                  `}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, selectedShelf, index)}
                >
                  <div className="text-xs font-mono text-muted-foreground text-center">
                    {slotNumber}
                  </div>
                  
                  {productInSlot ? (
                    <div 
                      className="flex-1 flex flex-col justify-center cursor-move"
                      draggable
                      onDragStart={(e) => handleDragStart(e, productInSlot.product)}
                    >
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground truncate">
                          {productInSlot.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {productInSlot.itemCount} items
                        </p>
                        
                        {/* Status breakdown */}
                        <div className="flex justify-center gap-1 mt-2">
                          {productInSlot.product.itemStatuses.available > 0 && (
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-foreground">{productInSlot.product.itemStatuses.available}</span>
                            </div>
                          )}
                          {productInSlot.product.itemStatuses.damaged > 0 && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-red-600" />
                              <span className="text-xs text-foreground">{productInSlot.product.itemStatuses.damaged}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Category badge */}
                        <Badge variant="outline" className="mt-2 text-xs">
                          {productInSlot.product.category}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-muted-foreground text-center">
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
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-border">
          <h4 className="font-medium mb-3 text-foreground">Status Legend & Instructions</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              <span className="text-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-foreground">Damaged</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-yellow-600" />
              <span className="text-foreground">In Repair</span>
            </div>
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-gray-600" />
              <span className="text-foreground">Unavailable</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            <Move className="h-4 w-4 inline mr-1" />
            Drag products to move all items of that product together to a new location.
          </p>
        </div>

        {detailedProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No products found for shelf mapping.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShelfMapping;
