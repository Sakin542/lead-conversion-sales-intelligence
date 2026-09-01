import React from 'react';
import Card from '../common/Card';
import { leadActivitySummary } from '../../data/dashboardData';
import { Mail, MousePointer, FileCheck, Presentation } from 'lucide-react';

export const LeadActivitySummary: React.FC = () => {
  const getIcon = (title: string) => {
    if (title.includes('Email')) return <Mail className="w-4 h-4 text-blue-400" />;
    if (title.includes('Visits')) return <MousePointer className="w-4 h-4 text-purple-400" />;
    if (title.includes('Form')) return <FileCheck className="w-4 h-4 text-emerald-400" />;
    return <Presentation className="w-4 h-4 text-amber-400" />;
  };

  return (
    <Card className="bg-slate-900/60 border-slate-800/80 p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white tracking-tight">Lead Activity Summary</h3>
        <p className="text-xs text-slate-400">30-day engagement metrics</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {leadActivitySummary.map((item) => (
          <div key={item.title} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">{item.title}</span>
              {getIcon(item.title)}
            </div>
            <p className="text-xl font-extrabold text-white">{item.count}</p>
            <span className="text-[10px] font-bold text-emerald-400">{item.change} vs last mo.</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LeadActivitySummary;

