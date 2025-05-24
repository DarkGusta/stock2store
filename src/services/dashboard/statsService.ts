
import { DashboardStats } from '@/types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Mock implementation - replace with actual API calls
  return {
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    ordersPending: 0,
    totalSales: 0,
    monthlyRevenue: Array(12).fill(0)
  };
};
