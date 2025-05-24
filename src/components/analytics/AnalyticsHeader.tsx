
import React from 'react';

const AnalyticsHeader: React.FC = () => {
  return (
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
  );
};

export default AnalyticsHeader;
