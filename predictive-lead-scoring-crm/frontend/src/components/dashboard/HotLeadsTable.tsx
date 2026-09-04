import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { topHotLeads, Lead } from '../../data/dashboardData';
import { Flame, ExternalLink, Sparkles } from 'lucide-react';
import LeadModal from './LeadModal';

export const HotLeadsTable: React.FC = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
          <Flame className="w-3 h-3 mr-1 text-emerald-400" />
          {score}% Hot
        </span>
      );
    } else if (score >= 60) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950/80 text-indigo-400 border border-indigo-800/80">
          {score}% Warm
        </span>
      );
    } else if (score >= 40) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-800/80">
          {score}% Medium
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-slate-400 border border-slate-700">
          {score}% Cold
        </span>
      );
    }
  };

  const getStageBadge = (stage: Lead['stage']) => {
    const stageStyles: Record<string, string> = {
      Qualified: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      Proposal: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      Negotiation: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      Contacted: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      New: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
      Won: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    };

    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${stageStyles[stage] || 'bg-slate-800 text-slate-300'}`}>
        {stage}
      </span>
    );
  };

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Top Leads</h3>
            </div>
            <p className="text-xs text-zinc-400">High intent prospects requiring priority outreach</p>
          </div>

          <Link to="/leads" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1">
            <span>View All Leads</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table Container */}
        <div className="w-full min-w-0 overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[640px] text-left text-xs text-zinc-300">
            <thead>
              <tr className="border-b border-[#222222] text-zinc-400 font-medium uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Lead</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {topHotLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#151515] transition-colors group">
                  {/* Lead Name & Email */}
                  <td className="py-3.5 px-4 font-medium text-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#151515] border border-[#222222] text-zinc-200 font-bold flex items-center justify-center text-xs shrink-0">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-purple-300 transition-colors">{lead.name}</p>
                        <p className="text-[11px] text-zinc-400">{lead.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="py-3.5 px-4 font-medium text-zinc-200 whitespace-nowrap">
                    {lead.company}
                  </td>

                  {/* Score */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getScoreBadge(lead.score)}
                  </td>

                  {/* Stage */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStageBadge(lead.stage)}
                  </td>

                  {/* Last Activity */}
                  <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                    {lead.lastActivity}
                  </td>

                  {/* Owner */}
                  <td className="py-3.5 px-4 text-zinc-300 font-medium whitespace-nowrap">
                    {lead.owner}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="px-3 py-1.5 rounded-lg bg-purple-950/40 text-purple-300 hover:bg-purple-600 hover:text-white font-medium text-xs transition-all border border-purple-800/40"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lead Inspection Modal */}
      <LeadModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </>
  );
};

export default HotLeadsTable;
