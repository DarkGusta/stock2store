
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MetricsCards from '@/components/analytics/MetricsCards';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import AnalyticsSidebar from '@/components/analytics/AnalyticsSidebar';

const Analytics = () => {
  return (
    <MainLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <MetricsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <AnalyticsCharts />
          </div>
          <div className="lg:col-span-1">
            <AnalyticsSidebar />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
