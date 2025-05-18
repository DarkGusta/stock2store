
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

/**
 * Gets products for store and products pages by mapping inventory data
 * to the Product interface
 */
export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching products from database...');
  
  try {
    // Fetch inventory items with their related data
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        id,
        name,
        description,
        quantity,
        created_at,
        updated_at,
        product_types (id, name),
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
    const products = data.map(item => {
      // Find the current active price
      const prices = item.price || [];
      let currentPrice = 0;
      
      // Filter for active prices
      const activePrices = prices.filter((p: any) => 
        p.status === true && 
        (!p.effective_to || new Date(p.effective_to) > new Date())
      );
      
      // Sort by effective_from date (newest first) and take the first one
      if (activePrices.length > 0) {
        activePrices.sort((a: any, b: any) => 
          new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
        );
        currentPrice = activePrices[0].amount;
      }

      return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: currentPrice,
        stock: item.quantity || 0, 
        image: '', // No images yet in the database
        category: item.product_types?.name || 'Uncategorized',
        location: '', // Location data is not yet available
        barcode: '', // Barcode not available yet
        createdAt: new Date(item.created_at || Date.now()),
        updatedAt: new Date(item.updated_at || Date.now())
      };
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
export const getDashboardStats = async () => {
  return {
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    ordersPending: 0,
    totalSales: 0,
    monthlyRevenue: Array(12).fill(0)
  };
};

/**
 * Gets recent orders for the dashboard
 */
export const getOrders = async () => {
  return [];
};
