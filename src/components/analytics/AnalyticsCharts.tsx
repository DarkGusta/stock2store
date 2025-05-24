
import React from 'react';
import { BarChart3, PieChart, LineChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AnalyticsCharts: React.FC = () => {
  return (
    <div className="lg:col-span-2">
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="mt-6">
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
        
        <TabsContent value="products" className="mt-6">
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
        
        <TabsContent value="customers" className="mt-6">
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
  );
};

export default AnalyticsCharts;
