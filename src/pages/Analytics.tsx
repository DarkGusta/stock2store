
import React from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp, Users, BarChart3, PieChart, LineChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { getAnalyticsData } from '@/services/analytics/analyticsService';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: getAnalyticsData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-green-500';
      case 'inventory': return 'bg-blue-500';
      case 'alert': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-red-600">Error Loading Analytics</h1>
          <p className="text-muted-foreground mt-2">Failed to load analytics data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights and performance metrics for your business
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(analyticsData?.totalRevenue || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-600" />
              From completed sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analyticsData?.productsSold || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Items marked as sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analyticsData?.totalOrders || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              All orders in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{analyticsData?.activeUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                Performance metrics and trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="revenue" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="customers">Customers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="revenue" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Revenue Trends</h3>
                    </div>
                    {isLoading ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={analyticsData?.monthlyRevenue || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                            <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="products" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold">Product Performance</h3>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                      <div className="text-center space-y-2">
                        <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">Product Sales Chart</p>
                        <p className="text-sm text-muted-foreground">Sales by category - Coming soon</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="customers" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold">Customer Analytics</h3>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                      <div className="text-center space-y-2">
                        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">Customer Demographics</p>
                        <p className="text-sm text-muted-foreground">User engagement data - Coming soon</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Products</CardTitle>
              <CardDescription>Best sellers by revenue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : analyticsData?.topProducts && analyticsData.topProducts.length > 0 ? (
                analyticsData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        <Package size={16} className={
                          index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : 'text-orange-600'
                        } />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(product.revenue)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No sales data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              ) : analyticsData?.recentActivity && analyticsData.recentActivity.length > 0 ? (
                analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`}></div>
                    <div>
                      <p className="text-sm font-medium">{activity.event}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
