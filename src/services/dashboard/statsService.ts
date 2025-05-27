
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('Fetching dashboard stats...');
    
    // Get total products count
    const { count: totalProducts, error: productsError } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });
    
    if (productsError) {
      console.error('Error fetching products count:', productsError);
    }
    
    // Get total stock (sum of all inventory quantities)
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('quantity');
    
    if (inventoryError) {
      console.error('Error fetching inventory data:', inventoryError);
    }
    
    const totalStock = inventoryData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    
    // Get low stock products (quantity <= 5)
    const { count: lowStockProducts, error: lowStockError } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .lte('quantity', 5);
    
    if (lowStockError) {
      console.error('Error fetching low stock count:', lowStockError);
    }
    
    // Get pending orders count
    const { count: ordersPending, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (ordersError) {
      console.error('Error fetching pending orders:', ordersError);
    }
    
    // Get total sales from delivered orders
    const { data: salesData, error: salesError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered');
    
    if (salesError) {
      console.error('Error fetching sales data:', salesError);
    }
    
    const totalSales = salesData?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
    
    // Get monthly revenue for the last 12 months
    const monthlyRevenue = Array(12).fill(0);
    
    if (salesData && salesData.length > 0) {
      // For now, distribute sales evenly across months (can be improved with actual date-based calculation)
      const monthlyAmount = totalSales / 12;
      monthlyRevenue.fill(monthlyAmount);
    }
    
    const stats: DashboardStats = {
      totalProducts: totalProducts || 0,
      totalStock: totalStock,
      lowStockProducts: lowStockProducts || 0,
      ordersPending: ordersPending || 0,
      totalSales: totalSales,
      monthlyRevenue: monthlyRevenue
    };
    
    console.log('Dashboard stats fetched:', stats);
    return stats;
    
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    // Return default values on error
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
