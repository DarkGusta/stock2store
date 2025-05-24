
import React from 'react';
import { 
  BarChart3, PieChart, LineChart, Calendar, ArrowUp, 
  ArrowDown, DollarSign, Package, ShoppingCart, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';

const Analytics = () => {
  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Insights and data visualizations for your business</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Generate Report
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$54,000</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">Active inventory items</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-orange-600">Pending orders</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">Compared to last month</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="revenue" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Revenue Overview
                    </CardTitle>
                    <CardDescription>Monthly revenue trends and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                      <div className="text-center space-y-2">
                        <LineChart className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Revenue chart will be displayed here</p>
                        <p className="text-sm text-muted-foreground">Connect your data source to view analytics</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Product Sales Distribution
                    </CardTitle>
                    <CardDescription>Sales breakdown by product categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                      <div className="text-center space-y-2">
                        <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Product sales chart will be displayed here</p>
                        <p className="text-sm text-muted-foreground">Showing distribution across categories</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="customers">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Customer Demographics
                    </CardTitle>
                    <CardDescription>Customer distribution and behavior analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                      <div className="text-center space-y-2">
                        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Customer analytics chart will be displayed here</p>
                        <p className="text-sm text-muted-foreground">Demographics and regional data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar with Additional Info */}
          <div className="space-y-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Products</CardTitle>
                <CardDescription>Best performing items this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Product A</p>
                      <p className="text-sm text-muted-foreground">Best seller</p>
                    </div>
                  </div>
                  <span className="font-semibold">$12,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Package size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Product B</p>
                      <p className="text-sm text-muted-foreground">Most ordered</p>
                    </div>
                  </div>
                  <span className="font-semibold">$8,920</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Package size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Product C</p>
                      <p className="text-sm text-muted-foreground">Trending</p>
                    </div>
                  </div>
                  <span className="font-semibold">$6,750</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">New order received</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Inventory updated</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full bg-muted hover:bg-muted/80 text-left p-3 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-muted-foreground" />
                    <span className="font-medium">Export Report</span>
                  </div>
                </button>
                <button className="w-full bg-muted hover:bg-muted/80 text-left p-3 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span className="font-medium">Schedule Report</span>
                  </div>
                </button>
                <button className="w-full bg-muted hover:bg-muted/80 text-left p-3 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-muted-foreground" />
                    <span className="font-medium">View Financials</span>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
