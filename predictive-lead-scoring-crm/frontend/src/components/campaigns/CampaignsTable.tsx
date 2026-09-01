import React from 'react';
import Card from '../common/Card';
import { Campaign } from '../../data/campaignsData';
import { Mail, Linkedin, Globe, Video, Send, MoreVertical } from 'lucide-react';

interface CampaignsTableProps {
  campaigns: Campaign[];
}

export const CampaignsTable: React.FC<CampaignsTableProps> = ({ campaigns }) => {
  const getChannelIcon = (channel: Campaign['channel']) => {
    switch (channel) {
      case 'Email':
        return <Mail className="w-4 h-4 text-emerald-400" />;
      case 'LinkedIn':
        return <Linkedin className="w-4 h-4 text-sky-400" />;
      case 'Google Ads':
        return <Globe className="w-4 h-4 text-blue-400" />;
      case 'Webinar':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'Cold Outbound':
        return <Send className="w-4 h-4 text-amber-400" />;
      default:
        return <Globe className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            Active
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950/80 text-blue-400 border border-blue-800">
            Scheduled
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950/80 text-indigo-400 border border-indigo-800">
            Completed
          </span>
        );
      case 'Paused':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
            Paused
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-800/80 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">All Campaigns</h3>
          <p className="text-xs text-slate-400">Track active marketing campaigns and budget utilization</p>
        </div>
        <span className="text-xs text-slate-400 font-mono">{campaigns.length} total</span>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4">Campaign</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Budget & Spend</th>
              <th className="py-3 px-4">Leads</th>
              <th className="py-3 px-4">Conv. Rate</th>
              <th className="py-3 px-4">ROI</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {campaigns.map((camp) => {
              const pctSpent = Math.min(100, Math.round((camp.spent / camp.budget) * 100));

              return (
                <tr key={camp.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Campaign Name */}
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {camp.name}
                  </td>

                  {/* Channel */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                        {getChannelIcon(camp.channel)}
                      </div>
                      <span className="font-semibold text-slate-200">{camp.channel}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(camp.status)}
                  </td>

                  {/* Budget & Spend Bar */}
                  <td className="py-3.5 px-4 whitespace-nowrap space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-white font-bold">${camp.spent.toLocaleString()}</span>
                      <span className="text-slate-400">/ ${camp.budget.toLocaleString()}</span>
                    </div>
                    <div className="w-32 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${pctSpent}%` }}
                      />
                    </div>
                  </td>

                  {/* Leads */}
                  <td className="py-3.5 px-4 font-extrabold text-white whitespace-nowrap font-mono">
                    {camp.leadsGenerated}
                  </td>

                  {/* Conv Rate */}
                  <td className="py-3.5 px-4 font-semibold text-emerald-400 whitespace-nowrap font-mono">
                    {camp.conversionRate}%
                  </td>

                  {/* ROI */}
                  <td className="py-3.5 px-4 font-extrabold text-indigo-400 whitespace-nowrap font-mono">
                    {camp.roi}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CampaignsTable;
