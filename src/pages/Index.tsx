
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingCart, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { getCurrentUser, products, orders, dashboardStats } from '@/utils/mockData';
import { UserRole } from '@/types';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Function to get welcome message based on user role
  const getWelcomeMessage = (role: UserRole) => {
    switch(role) {
      case 'admin':
        return "Welcome to your admin dashboard";
      case 'warehouse':
        return "Welcome to your warehouse dashboard";
      case 'customer':
        return "Welcome to your customer dashboard";
      case 'analyst':
        return "Welcome to your analytics dashboard";
      default:
        return "Welcome to Stock2Store";
    }
  };

  // Create chart data
  const chartData = dashboardStats.monthlyRevenue.map((value, index) => {
    // Month names
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      month: months[index],
      revenue: value,
    };
  });

  // Get low stock products
  const lowStockProducts = products.filter(product => product.stock <= 5);

  // Get recent orders
  const recentOrders = [...orders].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  ).slice(0, 5);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-500">{getWelcomeMessage(currentUser.role)}</p>
        </div>

        {/* Stats Section */}
        <DashboardStats stats={dashboardStats} />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart - Larger card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Revenue']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
                <AlertTriangle className="text-yellow-500" size={20} />
              </div>
              <CardDescription>Products that need reordering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-md">
                          <Package size={16} className="text-gray-600" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-gray-500 text-xs">Location: {product.location}</p>
                        </div>
                      </div>
                      <Badge variant={product.stock === 0 ? "destructive" : "outline"} className="ml-2">
                        {product.stock} left
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No low stock items</p>
                )}
              </div>
              <Button variant="outline" className="mt-4 w-full" asChild>
                <Link to="/products">View All Products</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/orders">View All</Link>
                </Button>
              </div>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <ShoppingCart size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">
                          {order.products.length} items · ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge 
                        variant={order.status === 'pending' ? "outline" : 
                                order.status === 'processing' ? "secondary" : 
                                order.status === 'delivered' ? "default" : "destructive"}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <ChevronRight size={16} className="ml-2 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Links Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for your role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentUser.role === 'admin' || currentUser.role === 'warehouse' ? (
                <>
                  <Button variant="outline" className="w-full justify-between">
                    New Product <ChevronRight size={16} />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Inventory Count <ChevronRight size={16} />
                  </Button>
                </>
              ) : null}
              
              {currentUser.role === 'customer' && (
                <>
                  <Button variant="outline" className="w-full justify-between">
                    My Orders <ChevronRight size={16} />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    My Returns <ChevronRight size={16} />
                  </Button>
                </>
              )}
              
              {currentUser.role === 'analyst' && (
                <>
                  <Button variant="outline" className="w-full justify-between">
                    Sales Reports <ChevronRight size={16} />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Inventory Analysis <ChevronRight size={16} />
                  </Button>
                </>
              )}
              
              <Button variant="outline" className="w-full justify-between">
                View Profile <ChevronRight size={16} />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Settings <ChevronRight size={16} />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
