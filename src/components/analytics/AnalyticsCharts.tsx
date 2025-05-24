
import React from 'react';
import { BarChart3, PieChart, LineChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AnalyticsCharts: React.FC = () => {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>Detailed insights and performance metrics</CardDescription>
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
                <h3 className="font-semibold">Revenue Overview</h3>
              </div>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                <div className="text-center space-y-2">
                  <LineChart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground font-medium">Revenue Chart</p>
                  <p className="text-sm text-muted-foreground">Monthly revenue trends and performance</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Product Sales Distribution</h3>
              </div>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                <div className="text-center space-y-2">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground font-medium">Product Sales Chart</p>
                  <p className="text-sm text-muted-foreground">Sales breakdown by categories</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="customers" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold">Customer Demographics</h3>
              </div>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground font-medium">Customer Analytics</p>
                  <p className="text-sm text-muted-foreground">Demographics and regional data</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCharts;
