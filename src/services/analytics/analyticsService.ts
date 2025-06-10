
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalRevenue: number;
  productsSold: number;
  totalOrders: number;
  activeUsers: number;
  topProducts: {
    name: string;
    category: string;
    revenue: number;
  }[];
  recentActivity: {
    event: string;
    timestamp: Date;
    type: 'order' | 'inventory' | 'alert';
  }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export const getAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    console.log('Fetching analytics data...');

    // Get sold items with their prices - using a more straightforward approach
    const { data: soldItems, error: soldItemsError } = await supabase
      .from('items')
      .select(`
        serial_id,
        updated_at,
        inventory!inner(
          name, 
          product_type:product_types!inner(name)
        )
      `)
      .eq('status', 'sold');

    if (soldItemsError) {
      console.error('Error fetching sold items:', soldItemsError);
      throw soldItemsError;
    }

    console.log('Sold items data:', soldItems);

    // Get prices for sold items separately
    const { data: prices, error: pricesError } = await supabase
      .from('price')
      .select('amount, inventory_id')
      .eq('status', true);

    if (pricesError) {
      console.error('Error fetching prices:', pricesError);
      throw pricesError;
    }

    console.log('Prices data:', prices);

    // Create a map of inventory_id to price
    const priceMap = new Map();
    prices?.forEach(price => {
      priceMap.set(price.inventory_id, price.amount);
    });

    // Calculate total revenue by matching items with their prices
    let totalRevenue = 0;
    const itemsWithRevenue: any[] = [];

    soldItems?.forEach(item => {
      const price = priceMap.get(item.inventory?.id);
      if (price) {
        const amount = Number(price);
        totalRevenue += amount;
        itemsWithRevenue.push({
          ...item,
          price: amount
        });
      }
    });

    console.log('Calculated total revenue:', totalRevenue);
    console.log('Items with revenue:', itemsWithRevenue);

    // Get products sold count
    const { count: productsSoldCount, error: productsSoldError } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sold');

    if (productsSoldError) {
      console.error('Error fetching products sold count:', productsSoldError);
    }

    // Get total orders
    const { count: totalOrdersCount, error: totalOrdersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (totalOrdersError) {
      console.error('Error fetching total orders:', totalOrdersError);
    }

    // Get active users count
    const { count: activeUsersCount, error: activeUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (activeUsersError) {
      console.error('Error fetching active users:', activeUsersError);
    }

    // Get top performing products - group by product name and sum revenue
    const topProducts = itemsWithRevenue
      ?.reduce((acc: any[], item) => {
        const productName = item.inventory?.name || 'Unknown Product';
        const category = item.inventory?.product_type?.name || 'Unknown';
        const revenue = item.price || 0;

        const existingProduct = acc.find(p => p.name === productName);
        if (existingProduct) {
          existingProduct.revenue += revenue;
        } else {
          acc.push({ name: productName, category, revenue });
        }
        return acc;
      }, [])
      ?.sort((a, b) => b.revenue - a.revenue)
      ?.slice(0, 3) || [];

    console.log('Top products:', topProducts);

    // Get recent activity (orders and transactions)
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select('created_at, status')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentOrdersError) {
      console.error('Error fetching recent orders:', recentOrdersError);
    }

    const { data: recentTransactions, error: recentTransactionsError } = await supabase
      .from('transactions')
      .select('created_at, transaction_type, notes')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentTransactionsError) {
      console.error('Error fetching recent transactions:', recentTransactionsError);
    }

    // Combine and format recent activity
    const recentActivity = [
      ...(recentOrders?.map(order => ({
        event: `Order ${order.status}`,
        timestamp: new Date(order.created_at!),
        type: 'order' as const
      })) || []),
      ...(recentTransactions?.map(transaction => ({
        event: transaction.notes || transaction.transaction_type === 'sale' ? 'Order processed' : 
               transaction.transaction_type === 'status_change' ? 'Inventory updated' : 
               'Low stock alert',
        timestamp: new Date(transaction.created_at!),
        type: transaction.transaction_type === 'sale' ? 'order' as const : 'inventory' as const
      })) || [])
    ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

    // Generate monthly revenue data for the last 12 months
    const monthlyRevenue = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      // Filter sold items by month and calculate revenue
      const monthlyItems = itemsWithRevenue?.filter(item => {
        const itemDate = new Date(item.updated_at);
        return itemDate >= monthDate && itemDate < nextMonth;
      }) || [];

      const monthRevenue = monthlyItems.reduce((sum, item) => sum + (item.price || 0), 0);
      
      monthlyRevenue.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue
      });
    }

    console.log('Monthly revenue data:', monthlyRevenue);

    const analytics: AnalyticsData = {
      totalRevenue,
      productsSold: productsSoldCount || 0,
      totalOrders: totalOrdersCount || 0,
      activeUsers: activeUsersCount || 0,
      topProducts,
      recentActivity,
      monthlyRevenue
    };

    console.log('Final analytics data:', analytics);
    return analytics;

  } catch (error) {
    console.error('Error in getAnalyticsData:', error);
    // Return default values on error
    return {
      totalRevenue: 0,
      productsSold: 0,
      totalOrders: 0,
      activeUsers: 0,
      topProducts: [],
      recentActivity: [],
      monthlyRevenue: []
    };
  }
};
