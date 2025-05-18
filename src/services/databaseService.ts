
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, Order, Product } from '@/types';

/**
 * Gets products for store and products pages by mapping inventory data
 * to the Product interface
 */
export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching products from database...');
  
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product_types (name),
        price (amount, effective_from, effective_to, status)
      `);

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    console.log('Raw products data:', data);
    
    if (!data || data.length === 0) {
      console.log('No products found in database');
      return [];
    }

    // Map the database response to our Product interface
    const products = data.map(inv => {
      // Sort prices by effective_from date (descending) and take the first valid one
      const prices = inv.price || [];
      
      // Log prices for debugging
      console.log(`Product ${inv.name} has ${prices.length} prices:`, prices);
      
      // Find active and valid price (status=true and not expired)
      let currentPrice = 0;
      if (prices.length > 0) {
        // Filter for active prices
        const activePrices = prices.filter((p: any) => 
          p.status === true && 
          (!p.effective_to || new Date(p.effective_to) > new Date())
        );
        
        console.log(`Product ${inv.name} has ${activePrices.length} active prices`);
        
        // Sort by effective_from date (newest first)
        if (activePrices.length > 0) {
          activePrices.sort((a: any, b: any) => 
            new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
          );
          currentPrice = activePrices[0].amount;
        }
      }

      console.log(`Product ${inv.name} final price: ${currentPrice}`);

      // Return product object with formatted data
      return {
        id: inv.id,
        name: inv.name,
        description: inv.description || '',
        price: currentPrice,
        stock: inv.quantity || 0, 
        image: '', // You might want to add images later
        category: inv.product_types?.name || 'Uncategorized',
        location: '', // You might want to add location data later
        createdAt: new Date(inv.created_at || Date.now()),
        updatedAt: new Date(inv.updated_at || Date.now())
      } as Product;
    });

    console.log('Transformed products:', products);
    return products;
  } catch (error) {
    console.error('Unexpected error in getProducts:', error);
    throw error;
  }
};

/**
 * Gets statistics for the dashboard
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  console.log('Fetching dashboard statistics...');
  
  try {
    // Get total products
    const { count: totalProducts } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });
    
    // Get total stock
    const { data: inventoryData } = await supabase
      .from('inventory')
      .select('quantity');
    
    const totalStock = inventoryData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    
    // Get low stock products (quantity <= 5)
    const { count: lowStockProducts } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .lte('quantity', 5);
    
    // Get pending orders
    const { count: ordersPending } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    // Get total sales value
    const { data: ordersData } = await supabase
      .from('orders')
      .select('total_amount')
      .not('status', 'eq', 'cancelled');
    
    const totalSales = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    
    // Generate mock monthly revenue for now
    // In a real app, you would calculate this from actual order data
    const monthlyRevenue = Array(12).fill(0).map(() => Math.floor(Math.random() * 50000) + 10000);
    
    return {
      totalProducts: totalProducts || 0,
      totalStock,
      lowStockProducts: lowStockProducts || 0,
      ordersPending: ordersPending || 0,
      totalSales,
      monthlyRevenue
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalProducts: 0,
      totalStock: 0,
      lowStockProducts: 0,
      ordersPending: 0,
      totalSales: 0,
      monthlyRevenue: Array(12).fill(0)
    };
  }
};

/**
 * Gets recent orders for the dashboard
 */
export const getOrders = async (): Promise<Order[]> => {
  console.log('Fetching orders...');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
    
    if (!data) {
      return [];
    }
    
    // Transform to match our Order interface
    return data.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      status: order.status,
      totalAmount: order.total_amount,
      products: [], // We would need to fetch order items separately for real data
      createdAt: order.created_at
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};
