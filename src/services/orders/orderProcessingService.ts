
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
      
      // Create transaction records for each sold item with the correct user ID
      const transactionData = availableItems.map(item => ({
        item_serial: item.serial_id,
        user_id: orderData.userId, // Use the actual customer's user ID
        transaction_type: 'sale',
        order_id: order.id,
        notes: `Item sold through order ${orderNumber} to customer ${orderData.userId}`
      }));
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData);
      
      if (transactionError) {
        console.error('Error creating transaction records:', transactionError);
        throw transactionError;
      }
      
      console.log(`Successfully created ${transactionData.length} transaction records for sold items`);
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

/**
 * Processes a refund by marking items as damaged and creating transaction records
 */
export const processRefund = async (orderId: string, adminUserId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Processing refund for order:', orderId);
    
    // Get all items from the order
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('item_serial')
      .eq('order_id', orderId);
    
    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
      throw orderItemsError;
    }
    
    if (!orderItems || orderItems.length === 0) {
      throw new Error('No items found for this order');
    }
    
    const serialIds = orderItems.map(item => item.item_serial);
    
    // Update item status to damaged (not in_repair)
    const { error: updateError } = await supabase
      .from('items')
      .update({ status: 'damaged' })
      .in('serial_id', serialIds);
    
    if (updateError) {
      console.error('Error updating item status to damaged:', updateError);
      throw updateError;
    }
    
    // Create transaction records for refund with the correct admin user
    const transactionData = serialIds.map(serialId => ({
      item_serial: serialId,
      user_id: adminUserId,
      transaction_type: 'refund',
      order_id: orderId,
      notes: 'Item returned due to approved refund request - status set to damaged'
    }));
    
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData);
    
    if (transactionError) {
      console.error('Error creating refund transaction records:', transactionError);
      throw transactionError;
    }
    
    console.log(`Successfully processed refund for ${serialIds.length} items - marked as damaged`);
    return { success: true };
    
  } catch (error) {
    console.error('Error processing refund:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};
