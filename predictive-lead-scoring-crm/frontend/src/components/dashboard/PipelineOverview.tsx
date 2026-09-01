import React from 'react';
import Card from '../common/Card';
import { pipelineStages } from '../../data/dashboardData';
import { Layers } from 'lucide-react';

export const PipelineOverview: React.FC = () => {
  return (
    <Card className="bg-slate-900/60 border-slate-800/80 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Sales Pipeline</h3>
          </div>
          <p className="text-xs text-slate-400">Current stage distribution & deal value</p>
        </div>
      </div>

      {/* Horizontal Pipeline Stages */}
      <div className="space-y-4">
        {pipelineStages.map((stage) => (
          <div key={stage.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold">{stage.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">({stage.count} leads)</span>
              </div>
              <span className="text-indigo-400 font-bold font-mono">{stage.value}</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 flex">
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
