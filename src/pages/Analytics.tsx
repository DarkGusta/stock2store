
import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, PieChart, Download, Calendar, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MainLayout from '@/components/layout/MainLayout';
import { dashboardStats, products, orders } from '@/utils/mockData';

// Chart colors
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#FF8042'];

// Sample data for charts
const categoryData = [
  { name: 'Electronics', value: 45 },
  { name: 'Furniture', value: 12 },
  { name: 'Kitchen', value: 18 },
  { name: 'Home', value: 22 },
  { name: 'Footwear', value: 15 },
];

const stockVsOrdersData = products.map(product => ({
  name: product.name,
  stock: product.stock,
  orders: Math.floor(Math.random() * product.stock * 0.8), // Random order data for demo
}));

const monthlyRevenueData = dashboardStats.monthlyRevenue.map((value, index) => {
  // Month names
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return {
    month: months[index],
    revenue: value,
    profit: value * 0.3, // 30% profit margin for demo
    costs: value * 0.7,
  };
});

const dailyOrderData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  orders: Math.floor(Math.random() * 10) + 1,
}));

const Analytics = () => {
  const [timeframe, setTimeframe] = useState("yearly");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Analytics</h1>
            <p className="text-gray-500">Business insights and reports</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="yearly" value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw size={16} />
            </Button>
            <Button>
              <Download size={16} className="mr-2" /> Export
            </Button>
          </div>
        </div>

        {/* Dashboard Stats & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <CardDescription>
                  All time sales revenue
                </CardDescription>
              </div>
              <div className="bg-primary/10 text-primary p-2 rounded-full">
                <DollarSign size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardStats.totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last period
              </p>
              <div className="mt-4 h-1 w-full bg-gray-200 rounded">
                <div className="h-1 bg-primary rounded" style={{ width: "75%" }} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <CardDescription>
                  Products in catalog
                </CardDescription>
              </div>
              <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                <Package size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                +12 products this month
              </p>
              <div className="mt-4 h-1 w-full bg-gray-200 rounded">
                <div className="h-1 bg-blue-600 rounded" style={{ width: "60%" }} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0">
                <CardTitle className="text-sm font-medium">
                  Active Orders
                </CardTitle>
                <CardDescription>
                  Orders in progress
                </CardDescription>
              </div>
              <div className="bg-orange-100 text-orange-700 p-2 rounded-full">
                <ShoppingCart size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.ordersPending}</div>
              <p className="text-xs text-muted-foreground">
                +2 from yesterday
              </p>
              <div className="mt-4 h-1 w-full bg-gray-200 rounded">
                <div className="h-1 bg-orange-500 rounded" style={{ width: "25%" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Tabs */}
        <Tabs defaultValue="revenue">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
          </div>

          {/* Revenue Chart */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>
                  Monthly revenue, costs, and profit for the current year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyRevenueData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, '']} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                      <Bar dataKey="profit" name="Profit" fill="#82ca9d" />
                      <Bar dataKey="costs" name="Costs" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Chart */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory vs Orders</CardTitle>
                <CardDescription>
                  Current stock levels compared to recent orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stockVsOrdersData.slice(0, 6)} // Limit to 6 products for readability
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="stock" name="Current Stock" fill="#8884d8" />
                      <Bar dataKey="orders" name="Recent Orders" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Categories Chart */}
          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Categories</CardTitle>
                  <CardDescription>
                    Distribution of products by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} products`, '']} />
                        <Legend />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>
                    Sales distribution by product category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Products" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Chart */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Trends</CardTitle>
                <CardDescription>
                  Daily order volume for the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dailyOrderData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} orders`, '']} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="orders" 
                        name="Orders" 
                        stroke="#8884d8" 
                        fill="#8884d8"
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {products.slice(0, 5).map((product, index) => (
                  <li key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-gray-500 text-sm mr-2">{index + 1}.</span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <span className="text-gray-500 text-sm">${product.price}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {products
                  .filter(p => p.stock <= 5)
                  .slice(0, 5)
                  .map(product => (
                    <li key={product.id} className="flex items-center justify-between">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-red-500 font-medium">{product.stock} left</span>
                    </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <span>Pending</span>
                  <span className="font-medium">{orders.filter(o => o.status === 'pending').length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Processing</span>
                  <span className="font-medium">{orders.filter(o => o.status === 'processing').length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Shipped</span>
                  <span className="font-medium">{orders.filter(o => o.status === 'shipped').length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Delivered</span>
                  <span className="font-medium">{orders.filter(o => o.status === 'delivered').length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Cancelled</span>
                  <span className="font-medium">{orders.filter(o => o.status === 'cancelled').length}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
