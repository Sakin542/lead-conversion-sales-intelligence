import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ConversionOverview from '../components/dashboard/ConversionOverview';
import LeadScoreDistribution from '../components/dashboard/LeadScoreDistribution';

export const Analytics: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sales Analytics</h1>
          <p className="text-sm text-zinc-400">Conversion trends and intent scoring intelligence</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConversionOverview />
          <LeadScoreDistribution />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;

