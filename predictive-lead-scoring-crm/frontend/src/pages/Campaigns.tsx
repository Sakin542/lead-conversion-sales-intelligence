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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2A2E] pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center">
            <Megaphone className="w-6 h-6 mr-2 text-[#FF7A00]" />
            Campaign Management
          </h1>
          <p className="text-sm text-zinc-400">
            Track marketing campaign budget allocation, acquisition channels, and ROI.
          </p>
        </div>

        <Button
          variant="ai"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-[#FF7A00]/20 shrink-0"
        >
          Create Campaign
        </Button>
      </div>

      {/* 2. Campaign KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {campaignKpis.map((kpi, idx) => (
          <Card key={idx} className="bg-[#171718] border-[#2A2A2E] p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">{kpi.title}</span>
              {idx === 0 && <Megaphone className="w-4 h-4 text-[#FF7A00]" />}
              {idx === 1 && <DollarSign className="w-4 h-4 text-emerald-400" />}
              {idx === 2 && <Target className="w-4 h-4 text-[#FF7A00]" />}
              {idx === 3 && <TrendingUp className="w-4 h-4 text-[#FF7A00]" />}
            </div>

            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-white font-mono">{kpi.value}</h3>
              <span className="text-xs font-bold text-emerald-400">{kpi.change}</span>
            </div>

            {kpi.subText && <p className="text-xs text-zinc-400 font-medium">{kpi.subText}</p>}
          </Card>
        ))}
      </div>

      {/* 3. Filter Pills */}
      <div className="flex items-center justify-between bg-[#171718] border border-[#2A2A2E] rounded-2xl p-2.5 px-4 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-400">
          <Filter className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>Status Filter:</span>
        </div>

        <div className="flex items-center space-x-1">
          {['All', 'Active', 'Scheduled', 'Completed', 'Paused'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-[#FF7A00] text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-[#29292C]'
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

