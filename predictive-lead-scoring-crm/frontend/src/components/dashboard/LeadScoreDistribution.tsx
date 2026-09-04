import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import Card from '../common/Card';
import { scoreDistributionData } from '../../data/dashboardData';
import { Target } from 'lucide-react';

export const LeadScoreDistribution: React.FC = () => {
  const totalLeads = scoreDistributionData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="p-6 flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-[#FF7A00]" />
            <h3 className="text-base font-bold text-white tracking-tight">Lead Score Distribution</h3>
          </div>
          <p className="text-xs text-[#A1A1AA]">AI predicted intent & probability breakdown</p>
        </div>
      </div>

      {/* Donut Chart & Category Breakdown Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Recharts Pie/Donut Chart */}
        <div className="h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={scoreDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
              >
                {scoreDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#171718" strokeWidth={2} />
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
                formatter={(value: any, name: any) => [`${value} leads`, name]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-bold text-white tracking-tight">{totalLeads}</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#A1A1AA]">Total Leads</span>
          </div>
        </div>

        {/* Legend / Category List */}
        <div className="space-y-3">
          {scoreDistributionData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#111113] border border-[#2A2A2E]">
              <div className="flex items-center space-x-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <span className="font-bold text-white">{item.name}</span>
                  <span className="text-[#A1A1AA] ml-1.5 font-mono text-[11px]">({item.range})</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-white">{item.count}</span>
                <span className="text-[10px] text-[#A1A1AA] block">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default LeadScoreDistribution;
