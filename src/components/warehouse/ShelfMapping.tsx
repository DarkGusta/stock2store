
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
  const [draggedItem, setDraggedItem] = useState<{
    serial_id: string;
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
          inventory (
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

      if (error) throw error;

      // Group items by inventory_id and count statuses
      const inventoryMap = new Map<string, ProductWithItems>();
      
      itemsData?.forEach((item: any) => {
        const inventoryId = item.inventory_id;
        if (!inventoryMap.has(inventoryId)) {
          const product = products.find(p => p.id === inventoryId);
          if (product) {
            inventoryMap.set(inventoryId, {
              ...product,
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

      return Array.from(inventoryMap.values());
    },
    enabled: products.length > 0
  });

  // Create shelf layout - simulate a warehouse with shelves A, B, C, D
  const shelves = ['A', 'B', 'C', 'D'];
  const slotsPerShelf = 12; // 3x4 grid per shelf

  // Get all items for a specific shelf
  const getItemsForShelf = (shelf: string) => {
    const shelfItems: Array<{
      item: any;
      product: ProductWithItems;
      slotPosition: number;
    }> = [];

    detailedProducts.forEach(product => {
      product.items.forEach(item => {
        if (item.location?.shelf_number === shelf) {
          // Calculate slot position based on slot_number (e.g., "1-01" -> position 0)
          const [row, slot] = item.location.slot_number.split('-');
          const slotPosition = (parseInt(row) - 1) * 4 + parseInt(slot) - 1;
          shelfItems.push({ item, product, slotPosition });
        }
      });
    });

    return shelfItems;
  };

  const handleDragStart = (e: React.DragEvent, item: any, product: ProductWithItems) => {
    setDraggedItem({
      serial_id: item.serial_id,
      product_name: product.name
    });
    e.dataTransfer.setData('text/plain', item.serial_id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetShelf: string, targetSlot: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;

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
            capacity: 1,
            status: true
          })
          .select('id')
          .single();

        if (locationError) throw locationError;
        targetLocation = newLocation;
      }

      // Check if target location is already occupied
      const { data: occupiedItem } = await supabase
        .from('items')
        .select('serial_id')
        .eq('location_id', targetLocation.id)
        .neq('serial_id', draggedItem.serial_id)
        .single();

      if (occupiedItem) {
        toast({
          title: 'Location Occupied',
          description: `Location ${targetLocationString} is already occupied by ${occupiedItem.serial_id}`,
          variant: 'destructive',
        });
        return;
      }

      // Get current location for transaction logging
      const { data: currentItem } = await supabase
        .from('items')
        .select(`
          location_id,
          locations (
            shelf_number,
            slot_number
          )
        `)
        .eq('serial_id', draggedItem.serial_id)
        .single();

      const oldLocation = currentItem?.locations 
        ? `${currentItem.locations.shelf_number}${currentItem.locations.slot_number}`
        : 'Unassigned';

      // Update item location
      const { error: updateError } = await supabase
        .from('items')
        .update({ location_id: targetLocation.id })
        .eq('serial_id', draggedItem.serial_id);

      if (updateError) throw updateError;

      // Create transaction record for location change
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          item_serial: draggedItem.serial_id,
          user_id: user.id,
          transaction_type: 'location_change',
          notes: `Item moved from ${oldLocation} to ${targetLocationString}`,
          source_location_id: currentItem?.location_id,
          destination_location_id: targetLocation.id
        });

      if (transactionError) throw transactionError;

      toast({
        title: 'Location Updated',
        description: `${draggedItem.product_name} (${draggedItem.serial_id}) moved to ${targetLocationString}`,
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['detailed-products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });

    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update location',
        variant: 'destructive',
      });
    } finally {
      setDraggedItem(null);
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

  const shelfItems = getItemsForShelf(selectedShelf);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Move className="h-5 w-5" />
          Warehouse Shelf Mapping
        </CardTitle>
        <CardDescription>
          Drag and drop items to change their location. Changes are logged in movements.
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
            <p className="text-sm text-gray-600">3 rows × 4 columns (drag items to move them)</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
            {Array.from({ length: slotsPerShelf }, (_, index) => {
              const row = Math.floor(index / 4) + 1;
              const slot = (index % 4) + 1;
              const slotNumber = `${selectedShelf}${row}-${slot.toString().padStart(2, '0')}`;
              
              // Find item in this slot
              const itemInSlot = shelfItems.find(shelfItem => shelfItem.slotPosition === index);
              
              return (
                <div
                  key={index}
                  className={`
                    border-2 rounded-lg p-3 h-32 flex flex-col justify-between transition-colors
                    ${itemInSlot 
                      ? 'border-blue-300 bg-blue-50 cursor-move' 
                      : 'border-gray-200 bg-white border-dashed'
                    }
                    ${draggedItem ? 'hover:border-green-400 hover:bg-green-50' : ''}
                  `}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, selectedShelf, index)}
                >
                  <div className="text-xs font-mono text-gray-500 text-center">
                    {slotNumber}
                  </div>
                  
                  {itemInSlot ? (
                    <div 
                      className="flex-1 flex flex-col justify-center cursor-move"
                      draggable
                      onDragStart={(e) => handleDragStart(e, itemInSlot.item, itemInSlot.product)}
                    >
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {itemInSlot.product.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 font-mono">
                          {itemInSlot.item.serial_id}
                        </p>
                        
                        {/* Item status indicator */}
                        <div className="flex justify-center mt-2">
                          {getStatusIcon(itemInSlot.item.status as keyof ItemStatus)}
                        </div>
                        
                        {/* Status badge */}
                        <Badge 
                          variant="outline" 
                          className={`mt-2 text-xs ${
                            itemInSlot.item.status === 'available'
                              ? 'border-green-300 text-green-700'
                              : itemInSlot.item.status === 'sold'
                              ? 'border-blue-300 text-blue-700'
                              : itemInSlot.item.status === 'damaged'
                              ? 'border-red-300 text-red-700'
                              : 'border-yellow-300 text-yellow-700'
                          }`}
                        >
                          {itemInSlot.item.status}
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
          <h4 className="font-medium mb-3">Status Legend & Instructions</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
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
          <p className="text-sm text-gray-600">
            <Move className="h-4 w-4 inline mr-1" />
            Drag items from one slot to another to change their location. All moves are logged in the movements tab.
          </p>
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
