import React from 'react';
import { 
  BarChart3, PieChart, LineChart, Calendar, ArrowUp, 
  ArrowDown, DollarSign, Package, ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';

const Analytics = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Analytics</h1>
            <p className="text-gray-500">Insights and data visualizations</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Generate Report
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with Key Metrics */}
          <div className="space-y-6">
            {/* Total Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>Overall sales performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-md">
                      <DollarSign size={20} className="text-green-600" />
                    </div>
                    <span className="ml-2 text-sm">Total Sales</span>
                  </div>
                  <span className="font-semibold">$54,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <Calendar size={20} className="text-blue-600" />
                    </div>
                    <span className="ml-2 text-sm">Last Month</span>
                  </div>
                  <span className="font-semibold">$4,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-md">
                      <ArrowUp size={20} className="text-yellow-600" />
                    </div>
                    <span className="ml-2 text-sm">Growth Rate</span>
                  </div>
                  <span className="font-semibold">+12%</span>
                </div>
              </CardContent>
            </Card>

            {/* Product Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Top selling products</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-md">
                      <Package size={20} className="text-purple-600" />
                    </div>
                    <span className="ml-2 text-sm">Best Seller</span>
                  </div>
                  <span className="font-semibold">Product A</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-pink-100 p-2 rounded-md">
                      <ShoppingCart size={20} className="text-pink-600" />
                    </div>
                    <span className="ml-2 text-sm">Most Ordered</span>
                  </div>
                  <span className="font-semibold">Product B</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-teal-100 p-2 rounded-md">
                      <ArrowDown size={20} className="text-teal-600" />
                    </div>
                    <span className="ml-2 text-sm">Lowest Stock</span>
                  </div>
                  <span className="font-semibold">Product C</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 space-y-2">
                  <BarChart3 size={40} className="mx-auto text-gray-400" />
                  <p className="text-gray-500">Track key performance indicators</p>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-2 px-4 rounded">
                    View Full Report
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs for different analytics views */}
            <Tabs defaultValue="revenue" className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Monthly revenue trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChart className="h-48 w-full text-gray-400" />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Sales</CardTitle>
                    <CardDescription>Sales distribution by product</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart className="h-48 w-full text-gray-400" />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="customers">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Demographics</CardTitle>
                    <CardDescription>Customer distribution by region</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BarChart3 className="h-48 w-full text-gray-400" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
