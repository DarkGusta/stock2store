
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 space-y-2">
          <BarChart3 size={40} className="mx-auto text-gray-400" />
          <p className="text-gray-500">Advanced inventory analytics</p>
          <Button variant="outline" size="sm">Open Analytics</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
