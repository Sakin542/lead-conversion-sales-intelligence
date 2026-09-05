import React from 'react';
import Card from '../common/Card';
import { channelSummaries } from '../../data/campaignsData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';

export const CampaignChannelBreakdown: React.FC = () => {
  return (
    <Card className="bg-[#171718] border-[#2A2A2E] p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Layers className="w-4 h-4 text-[#FF7A00]" />
        <h3 className="text-base font-bold text-white tracking-tight">Leads by Channel</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Recharts Pie */}
        <div className="h-44 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelSummaries}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="leadCount"
              >
                {channelSummaries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#111113" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171718',
                  borderColor: '#2A2A2E',
                  borderRadius: '0.75rem',
                  color: '#FFFFFF',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [`${val} leads`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Details */}
        <div className="space-y-2.5">
          {channelSummaries.map((item) => (
            <div key={item.channel} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-zinc-200">{item.channel}</span>
              </div>
              <div className="flex items-center space-x-2 font-mono">
                <span className="font-bold text-white">{item.leadCount}</span>
                <span className="text-zinc-400 text-[10px]">({item.share}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CampaignChannelBreakdown;

