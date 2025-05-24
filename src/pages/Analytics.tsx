
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import MetricsCards from '@/components/analytics/MetricsCards';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import AnalyticsSidebar from '@/components/analytics/AnalyticsSidebar';

const Analytics = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        <AnalyticsHeader />
        <MetricsCards />
        
        {/* Main Analytics Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <AnalyticsCharts />
          <AnalyticsSidebar />
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
