
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

    // Get total revenue from sold items
    const { data: soldItems, error: soldItemsError } = await supabase
      .from('items')
      .select(`
        price:price!inner(amount),
        inventory:inventory!inner(name, product_type:product_types!inner(name))
      `)
      .eq('status', 'sold');

    if (soldItemsError) {
      console.error('Error fetching sold items:', soldItemsError);
    }

    const totalRevenue = soldItems?.reduce((sum, item) => {
      return sum + (item.price?.amount || 0);
    }, 0) || 0;

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

    // Get top performing products
    const topProducts = soldItems
      ?.reduce((acc: any[], item) => {
        const productName = item.inventory?.name || 'Unknown Product';
        const category = item.inventory?.product_type?.name || 'Unknown';
        const revenue = item.price?.amount || 0;

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

    // Get recent activity (orders and transactions)
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select('created_at, status')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentOrdersError) {
      console.error('Error fetching recent orders:', recentOrdersError);
    }

    const { data: recentTransactions, error: recentTransactionsError } = await supabase
      .from('transactions')
      .select('created_at, transaction_type')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentTransactionsError) {
      console.error('Error fetching recent transactions:', recentTransactionsError);
    }

    // Combine and format recent activity
    const recentActivity = [
      ...(recentOrders?.map(order => ({
        event: `New order ${order.status}`,
        timestamp: new Date(order.created_at!),
        type: 'order' as const
      })) || []),
      ...(recentTransactions?.map(transaction => ({
        event: transaction.transaction_type === 'sale' ? 'New order processed' : 
               transaction.transaction_type === 'status_change' ? 'Inventory updated' : 
               'Low stock alert',
        timestamp: new Date(transaction.created_at!),
        type: transaction.transaction_type === 'sale' ? 'order' as const : 'inventory' as const
      })) || [])
    ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

    // Generate monthly revenue data for the last 12 months
    const monthlyRevenue = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const { data: monthlyOrders, error: monthlyError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', monthDate.toISOString())
        .lt('created_at', nextMonth.toISOString());

      if (monthlyError) {
        console.error('Error fetching monthly revenue:', monthlyError);
      }

      const monthRevenue = monthlyOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      
      monthlyRevenue.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue
      });
    }

    const analytics: AnalyticsData = {
      totalRevenue,
      productsSold: productsSoldCount || 0,
      totalOrders: totalOrdersCount || 0,
      activeUsers: activeUsersCount || 0,
      topProducts,
      recentActivity,
      monthlyRevenue
    };

    console.log('Analytics data fetched:', analytics);
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
