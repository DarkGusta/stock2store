
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderData {
  userId: string;
  items: OrderItem[];
  invoiceData: any;
  paymentData: any;
}

/**
 * Creates an order and updates inventory by marking items as sold
 */
export const processOrder = async (orderData: OrderData): Promise<{ success: boolean; orderId?: string; error?: string }> => {
  console.log('Processing order:', orderData);
  
  try {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate total amount
    const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create the order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.userId,
        order_number: orderNumber,
        total_amount: totalAmount,
        status: 'pending'
      })
      .select('id')
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }
    
    console.log('Order created:', order);
    
    // Process each item in the order
    for (const orderItem of orderData.items) {
      console.log(`Processing ${orderItem.quantity} items for product ${orderItem.productId}`);
      
      // First verify the inventory exists and has enough stock
      const { data: inventoryCheck, error: inventoryError } = await supabase
        .from('inventory')
        .select('id, name, quantity')
        .eq('id', orderItem.productId)
        .single();
      
      if (inventoryError) {
        console.error('Error checking inventory:', inventoryError);
        throw new Error(`Product ${orderItem.productId} not found`);
      }
      
      console.log('Inventory check:', inventoryCheck);

      // Get available items for this product (must match inventory_id with the product ID)
      const { data: availableItems, error: itemsError } = await supabase
        .from('items')
        .select('serial_id, inventory_id')
        .eq('inventory_id', orderItem.productId)
        .eq('status', 'available')
        .order('serial_id', { ascending: true })
        .limit(orderItem.quantity);
      
      if (itemsError) {
        console.error('Error fetching available items:', itemsError);
        throw itemsError;
      }
      
      console.log(`Found ${availableItems?.length || 0} available items for product ${orderItem.productId}`);
      
      if (!availableItems || availableItems.length < orderItem.quantity) {
        throw new Error(`Insufficient stock for product ${inventoryCheck.name}. Available: ${availableItems?.length || 0}, Required: ${orderItem.quantity}`);
      }
      
      console.log('Available items to mark as sold:', availableItems);
      
      // Mark items as sold
      const serialIds = availableItems.map(item => item.serial_id);
      const { error: updateError } = await supabase
        .from('items')
        .update({ status: 'sold' })
        .in('serial_id', serialIds);
      
      if (updateError) {
        console.error('Error updating item status:', updateError);
        throw updateError;
      }
      
      console.log(`Successfully marked ${serialIds.length} items as sold:`, serialIds);
      
      // Create order_items records
      const orderItemsData = availableItems.map(item => ({
        order_id: order.id,
        item_serial: item.serial_id,
        price: orderItem.price
      }));
      
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);
      
      if (orderItemsError) {
        console.error('Error creating order items:', orderItemsError);
        throw orderItemsError;
      }
      
      console.log(`Successfully processed ${orderItem.quantity} items for product ${orderItem.productId}`);
    }
    
    console.log('Order processing completed successfully');
    return { success: true, orderId: order.id };
    
  } catch (error) {
    console.error('Error processing order:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

/**
 * Completes an order by changing its status to completed
 */
export const completeOrder = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);
    
    if (error) {
      console.error('Error completing order:', error);
      throw error;
    }
    
    console.log('Order completed successfully:', orderId);
    return { success: true };
    
  } catch (error) {
    console.error('Error completing order:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};
