
import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  status: boolean;
  category: string;
  serial_items: {
    serial_id: string;
    status: 'available' | 'sold' | 'damaged' | 'in_repair' | 'unavailable' | 'pending';
  }[];
}

/**
 * Gets detailed inventory information including individual item statuses
 */
export const getDetailedInventory = async (): Promise<InventoryItem[]> => {
  console.log('Fetching detailed inventory with item statuses...');
  
  try {
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        id,
        name,
        description,
        quantity,
        status,
        product_type_id,
        items!inner (
          serial_id,
          status
        )
      `);
      
    if (inventoryError) {
      console.error('Error fetching detailed inventory:', inventoryError);
      throw inventoryError;
    }
    
    console.log('Detailed inventory data:', inventoryData);
    
    if (!inventoryData || inventoryData.length === 0) {
      console.log('No detailed inventory data found');
      return [];
    }
    
    // Get product types for categories
    const { data: productTypes, error: typesError } = await supabase
      .from('product_types')
      .select('id, name');
      
    if (typesError) {
      console.error('Error fetching product types:', typesError);
    }
    
    const typeMap = new Map();
    if (productTypes) {
      productTypes.forEach((type: any) => {
        typeMap.set(type.id, type.name);
      });
    }
    
    // Process the data to group items by inventory
    const inventoryMap = new Map();
    
    inventoryData.forEach((item: any) => {
      const inventoryId = item.id;
      
      if (!inventoryMap.has(inventoryId)) {
        inventoryMap.set(inventoryId, {
          id: item.id,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          status: item.status,
          category: typeMap.get(item.product_type_id) || 'Uncategorized',
          serial_items: []
        });
      }
      
      // Add item details if items exist
      if (item.items && Array.isArray(item.items)) {
        item.items.forEach((serialItem: any) => {
          inventoryMap.get(inventoryId).serial_items.push({
            serial_id: serialItem.serial_id,
            status: serialItem.status
          });
        });
      }
    });
    
    const result = Array.from(inventoryMap.values());
    console.log('Processed detailed inventory:', result);
    
    return result;
  } catch (error) {
    console.error('Error in getDetailedInventory:', error);
    throw error;
  }
};

/**
 * Updates the status of a specific item - transaction logging is handled by database trigger
 */
export const updateItemStatus = async (
  serialId: string, 
  newStatus: 'available' | 'sold' | 'damaged' | 'in_repair' | 'unavailable' | 'pending',
  userId: string,
  reason?: string
): Promise<boolean> => {
  try {
    console.log(`Updating item ${serialId} status to ${newStatus} by user ${userId}`);
    
    // Update item status with performed_by_user_id - the database trigger will handle transaction logging automatically
    const { error: updateError } = await supabase
      .from('items')
      .update({ 
        status: newStatus,
        performed_by_user_id: userId
      })
      .eq('serial_id', serialId);
    
    if (updateError) {
      console.error('Error updating item status:', updateError);
      throw updateError;
    }
    
    console.log(`Successfully updated item ${serialId} to status ${newStatus} - transaction logged by trigger`);
    return true;
  } catch (error) {
    console.error('Error in updateItemStatus:', error);
    return false;
  }
};

/**
 * Helper function to determine transaction type based on status change
 */
const getTransactionType = (oldStatus: string, newStatus: string): string => {
  if (newStatus === 'available' && oldStatus !== 'available') {
    return 'status_change';
  }
  if (newStatus === 'damaged') {
    return 'damage';
  }
  if (newStatus === 'in_repair') {
    return 'repair';
  }
  if (newStatus === 'unavailable') {
    return 'status_change';
  }
  if (newStatus === 'pending') {
    return 'status_change';
  }
  return 'status_change';
};

/**
 * Gets the count of items by status for an inventory item
 */
export const getItemStatusCounts = (serialItems: InventoryItem['serial_items']) => {
  const counts = {
    available: 0,
    sold: 0,
    damaged: 0,
    in_repair: 0,
    unavailable: 0,
    pending: 0,
  };
  
  serialItems.forEach(item => {
    counts[item.status]++;
  });
  
  return counts;
};
