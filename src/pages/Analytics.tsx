
import React from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp, Users, BarChart3, PieChart, LineChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Analytics = () => {
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
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-600" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">
              +180 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
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
                    <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                      <div className="text-center space-y-2">
                        <LineChart className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">Revenue Chart</p>
                        <p className="text-sm text-muted-foreground">Monthly revenue trends</p>
                      </div>
                    </div>
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
                        <p className="text-sm text-muted-foreground">Sales by category</p>
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
                        <p className="text-sm text-muted-foreground">User engagement data</p>
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
              <CardDescription>Best sellers this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Premium Headphones</p>
                    <p className="text-xs text-muted-foreground">Electronics</p>
                  </div>
                </div>
                <span className="font-semibold text-sm">$12,450</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Package size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Smart Watch</p>
                    <p className="text-xs text-muted-foreground">Wearables</p>
                  </div>
                </div>
                <span className="font-semibold text-sm">$8,920</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Package size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Wireless Speaker</p>
                    <p className="text-xs text-muted-foreground">Audio</p>
                  </div>
                </div>
                <span className="font-semibold text-sm">$6,750</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">New order processed</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Inventory updated</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Low stock alert</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
