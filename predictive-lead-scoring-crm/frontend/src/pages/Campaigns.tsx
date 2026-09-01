import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CampaignsTable from '../components/campaigns/CampaignsTable';
import CampaignChannelBreakdown from '../components/campaigns/CampaignChannelBreakdown';
import NewCampaignModal from '../components/campaigns/NewCampaignModal';
import { campaignKpis, mockCampaigns, Campaign } from '../data/campaignsData';
import { Plus, Filter, Megaphone, TrendingUp, DollarSign, Target } from 'lucide-react';

export const Campaigns: React.FC = () => {
  const [campaignList, setCampaignList] = useState<Campaign[]>(mockCampaigns);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const filteredCampaigns = campaignList.filter((camp) => {
    if (statusFilter === 'All') return true;
    return camp.status === statusFilter;
  });

  const handleAddCampaign = (newCamp: Campaign) => {
    setCampaignList([newCamp, ...campaignList]);
  };

  return (
    <DashboardLayout>
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center">
            <Megaphone className="w-6 h-6 mr-2 text-indigo-400" />
            Campaign Management
          </h1>
          <p className="text-sm text-slate-400">
            Track marketing campaign budget allocation, acquisition channels, and ROI.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 border-none shrink-0"
        >
          Create Campaign
        </Button>
      </div>

      {/* 2. Campaign KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {campaignKpis.map((kpi, idx) => (
          <Card key={idx} className="bg-slate-900/60 border-slate-800/80 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{kpi.title}</span>
              {idx === 0 && <Megaphone className="w-4 h-4 text-indigo-400" />}
              {idx === 1 && <DollarSign className="w-4 h-4 text-emerald-400" />}
              {idx === 2 && <Target className="w-4 h-4 text-blue-400" />}
              {idx === 3 && <TrendingUp className="w-4 h-4 text-purple-400" />}
            </div>

            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-white font-mono">{kpi.value}</h3>
              <span className="text-xs font-bold text-emerald-400">{kpi.change}</span>
            </div>

            {kpi.subText && <p className="text-xs text-slate-400 font-medium">{kpi.subText}</p>}
          </Card>
        ))}
      </div>

      {/* 3. Filter Pills */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 px-4 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Status Filter:</span>
        </div>

        <div className="flex items-center space-x-1">
          {['All', 'Active', 'Scheduled', 'Completed', 'Paused'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Campaigns Analytics & Main Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CampaignsTable campaigns={filteredCampaigns} />
        </div>
        <div>
          <CampaignChannelBreakdown />
        </div>
      </div>

      {/* Create New Campaign Modal */}
      <NewCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAddCampaign}
      />
    </DashboardLayout>
  );
};

export default Campaigns;

