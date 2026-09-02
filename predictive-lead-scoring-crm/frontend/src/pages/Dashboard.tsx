import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import ConversionOverview from '../components/dashboard/ConversionOverview';
import LeadScoreDistribution from '../components/dashboard/LeadScoreDistribution';
import HotLeadsTable from '../components/dashboard/HotLeadsTable';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentActivities from '../components/dashboard/RecentActivities';
import LeadActivitySummary from '../components/dashboard/LeadActivitySummary';
import AIScoringInsight from '../components/dashboard/AIScoringInsight';
import QuickActions from '../components/dashboard/QuickActions';
import Button from '../components/common/Button';
import { kpiMetrics, KPIMetric } from '../data/dashboardData';
import { Plus, Filter } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Dynamic KPI multipliers based on timeframe selection
  const getDynamicKPIs = (): KPIMetric[] => {
    switch (timeframe) {
      case '7d':
        return [
          { ...kpiMetrics[0], value: '712', change: '+5.2%', comparison: 'vs last week' },
          { ...kpiMetrics[1], value: '98', change: '+9.4%', comparison: 'vs last week' },
          { ...kpiMetrics[2], value: '26.1%', change: '+2.1%', comparison: 'vs last week' },
          { ...kpiMetrics[3], value: '$310K', change: '+4.3%', comparison: 'vs last week' },
        ];
      case '90d':
        return [
          { ...kpiMetrics[0], value: '8,420', change: '+24.1%', comparison: 'vs last quarter' },
          { ...kpiMetrics[1], value: '1,140', change: '+31.8%', comparison: 'vs last quarter' },
          { ...kpiMetrics[2], value: '23.4%', change: '+6.2%', comparison: 'vs last quarter' },
          { ...kpiMetrics[3], value: '$3.85M', change: '+19.4%', comparison: 'vs last quarter' },
        ];
      case '1y':
        return [
          { ...kpiMetrics[0], value: '32,450', change: '+42.8%', comparison: 'vs last year' },
          { ...kpiMetrics[1], value: '4,280', change: '+56.2%', comparison: 'vs last year' },
          { ...kpiMetrics[2], value: '22.9%', change: '+8.1%', comparison: 'vs last year' },
          { ...kpiMetrics[3], value: '$14.6M', change: '+38.5%', comparison: 'vs last year' },
        ];
      default:
        return kpiMetrics;
    }
  };

  const currentKPIs = getDynamicKPIs();

  return (
    <DashboardLayout>
      {/* 1. Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Good morning, {firstName}
          </h1>
          <p className="text-sm text-slate-400">
            Here's what's happening with your sales pipeline today.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/leads/new')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none shrink-0 text-white"
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Interactive Timeframe Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 px-4 shadow-sm min-w-0">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 shrink-0">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Period Filter:</span>
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0 min-w-0">
          {[
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: '90d', label: 'This Quarter' },
            { id: '1y', label: 'This Year' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setTimeframe(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === pill.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {currentKPIs.map((metric) => (
          <StatCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* 3. AI Scoring Insight Highlight Banner */}
      <AIScoringInsight />

      {/* 4. Analytics & Charts Section (2 Columns Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionOverview />
        <LeadScoreDistribution />
      </div>

      {/* 5. Top Hot Leads Table */}
      <HotLeadsTable />

      {/* 6. Pipeline & Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineOverview />
        <RecentActivities />
      </div>

      {/* 7. Activity Summary & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadActivitySummary />
        <QuickActions />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
