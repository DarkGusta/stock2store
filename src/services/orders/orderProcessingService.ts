
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
 * Creates an order and updates inventory by marking items as pending
 * The database trigger will automatically handle transaction logging
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

      // Get available items for this product
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
      
      console.log('Available items to reserve for order:', availableItems);
      
      // Mark items as pending - the database trigger will handle transaction logging
      const serialIds = availableItems.map(item => item.serial_id);
      const { error: updateError } = await supabase
        .from('items')
        .update({ status: 'pending' })
        .in('serial_id', serialIds);
      
      if (updateError) {
        console.error('Error updating item status to pending:', updateError);
        throw updateError;
      }
      
      console.log(`Successfully marked ${serialIds.length} items as pending:`, serialIds);
      
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
 * Completes an order by changing its status to completed and marking items as sold
 * The database trigger will handle transaction logging
 */
export const completeOrder = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get current user for context
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    // Get all order items for this order
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('item_serial')
      .eq('order_id', orderId);
    
    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
      throw orderItemsError;
    }

    if (orderItems && orderItems.length > 0) {
      const serialIds = orderItems.map(item => item.item_serial);
      
      // Set the performed_by_user_id and mark items as sold
      const { error: updateError } = await supabase
        .from('items')
        .update({ 
          status: 'sold',
          performed_by_user_id: currentUserId
        })
        .in('serial_id', serialIds);
      
      if (updateError) {
        console.error('Error updating item status to sold:', updateError);
        throw updateError;
      }
      
      console.log(`Successfully marked ${serialIds.length} items as sold:`, serialIds);
    }

    // Update order status to completed
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
 * Rejects an order by changing its status to rejected and marking items as unavailable
 * The database trigger will handle transaction logging with the correct warehouse user
 */
export const rejectOrder = async (orderId: string, rejectionReason: string, adminUserId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Rejecting order:', orderId, 'Reason:', rejectionReason, 'By user:', adminUserId);
    
    // Get all order items for this order
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('item_serial')
      .eq('order_id', orderId);
    
    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
      throw orderItemsError;
    }

    if (orderItems && orderItems.length > 0) {
      const serialIds = orderItems.map(item => item.item_serial);
      
      // Set the performed_by_user_id and mark items as unavailable
      const { error: updateError } = await supabase
        .from('items')
        .update({ 
          status: 'unavailable',
          performed_by_user_id: adminUserId
        })
        .in('serial_id', serialIds);
      
      if (updateError) {
        console.error('Error updating item status to unavailable:', updateError);
        throw updateError;
      }
      
      console.log(`Successfully marked ${serialIds.length} items as unavailable due to order rejection:`, serialIds);
    }

    // Update order status to rejected
    const { error } = await supabase
      .from('orders')
      .update({ status: 'rejected' })
      .eq('id', orderId);
    
    if (error) {
      console.error('Error rejecting order:', error);
      throw error;
    }
    
    console.log('Order rejected successfully:', orderId);
    return { success: true };
    
  } catch (error) {
    console.error('Error rejecting order:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

/**
 * Processes a refund by marking items as damaged
 * The database trigger will handle transaction logging
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
    
    // Set the performed_by_user_id and update item status to damaged
    const { error: updateError } = await supabase
      .from('items')
      .update({ 
        status: 'damaged',
        performed_by_user_id: adminUserId
      })
      .in('serial_id', serialIds);
    
    if (updateError) {
      console.error('Error updating item status to damaged:', updateError);
      throw updateError;
    }
    
    console.log(`Successfully processed refund for ${serialIds.length} items - marked as damaged`);
    return { success: true };
    
  } catch (error) {
    console.error('Error processing refund:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};
