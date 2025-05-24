
import React from 'react';
import { Package, BarChart3, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsSidebar: React.FC = () => {
  return (
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
  );
};

export default AnalyticsSidebar;
