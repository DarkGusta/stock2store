
import React from 'react';
import { 
  Package, ShoppingCart, AlertTriangle, DollarSign, TrendingUp, Archive 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardStats as DashboardStatsType } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, value, icon, description, trend, className 
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
            
            {trend && (
              <div className={`flex items-center mt-2 text-xs font-medium
                ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
              >
                {trend.isPositive ? (
                  <TrendingUp size={14} className="mr-1" />
                ) : (
                  <TrendingUp size={14} className="mr-1 transform rotate-180" />
                )}
                {trend.value}% {trend.isPositive ? 'increase' : 'decrease'}
              </div>
            )}
          </div>
          <div className="bg-blue-50 text-blue-700 p-3 rounded-full h-12 w-12 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate month-over-month change
  const calculateMoM = (currentMonth: number, previousMonth: number) => {
    if (previousMonth === 0) return 100;
    return Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
  };

  // Get the last two months from the monthly revenue data
  const currentMonth = stats.monthlyRevenue[stats.monthlyRevenue.length - 1];
  const previousMonth = stats.monthlyRevenue[stats.monthlyRevenue.length - 2];
  const momChange = calculateMoM(currentMonth, previousMonth);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Products"
        value={stats.totalProducts}
        icon={<Package size={24} />}
        description="Products in catalog"
        className="border-l-4 border-blue-500"
      />
      
      <StatCard
        title="Total Inventory"
        value={stats.totalStock}
        icon={<Archive size={24} />}
        description="Items in stock"
        className="border-l-4 border-green-500"
      />
      
      <StatCard
        title="Low Stock Items"
        value={stats.lowStockProducts}
        icon={<AlertTriangle size={24} />}
        description="Products need restock"
        className="border-l-4 border-yellow-500"
      />
      
      <StatCard
        title="Pending Orders"
        value={stats.ordersPending}
        icon={<ShoppingCart size={24} />}
        description="Orders to process"
        className="border-l-4 border-purple-500"
      />
      
      <StatCard
        title="Total Sales"
        value={formatCurrency(stats.totalSales)}
        icon={<DollarSign size={24} />}
        description="Revenue to date"
        trend={{ value: momChange, isPositive: momChange >= 0 }}
        className="border-l-4 border-emerald-500 lg:col-span-2"
      />
      
      <StatCard
        title="Monthly Revenue"
        value={formatCurrency(currentMonth)}
        icon={<DollarSign size={24} />}
        description="Current month"
        trend={{ value: momChange, isPositive: momChange >= 0 }}
        className="border-l-4 border-indigo-500 lg:col-span-2"
      />
    </div>
  );
};

export default DashboardStats;
