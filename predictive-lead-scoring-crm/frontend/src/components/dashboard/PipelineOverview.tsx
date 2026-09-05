import React from 'react';
import Card from '../common/Card';
import { pipelineStages } from '../../data/dashboardData';
import { Layers } from 'lucide-react';

interface PipelineOverviewProps {
  stages?: any[];
}

export const PipelineOverview: React.FC<PipelineOverviewProps> = ({ stages }) => {
  const stageList = stages && stages.length > 0 ? stages.map(s => ({
    id: s.stage.toLowerCase(),
    name: s.stage,
    count: s.count,
    value: `$${(s.value || 0).toLocaleString()}`,
    percentage: 100,
    color: s.stage === 'Won' ? '#10b981' : s.stage === 'Qualified' ? '#6366f1' : s.stage === 'Proposal' ? '#a855f7' : s.stage === 'Negotiation' ? '#f59e0b' : '#FF7A00',
  })) : pipelineStages;

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#FF7A00]" />
            <h3 className="text-base font-bold text-white tracking-tight">Sales Pipeline</h3>
          </div>
          <p className="text-xs text-[#A1A1AA]">Current stage distribution & deal value</p>
        </div>
      </div>

      {/* Horizontal Pipeline Stages */}
      <div className="space-y-4">
        {stageList.map((stage) => (
          <div key={stage.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold">{stage.name}</span>
                <span className="text-[#A1A1AA] font-mono text-[11px]">({stage.count} leads)</span>
              </div>
              <span className="text-[#FF7A00] font-bold font-mono">{stage.value}</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-3 bg-[#111113] rounded-full overflow-hidden border border-[#2A2A2E] flex">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stage.percentage}%`,
                  backgroundColor: stage.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PipelineOverview;
