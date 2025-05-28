
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';

const Returns = () => {
  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Returns & Refunds
            </h1>
            <p className="text-muted-foreground">
              Manage product returns and refund requests
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Returns Management
              </CardTitle>
              <CardDescription>
                This page will contain the returns management functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Returns functionality will be implemented here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Returns;
