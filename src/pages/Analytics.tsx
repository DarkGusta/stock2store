
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import MetricsCards from '@/components/analytics/MetricsCards';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import AnalyticsSidebar from '@/components/analytics/AnalyticsSidebar';

const Analytics = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <AnalyticsHeader />
        
        <MetricsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
