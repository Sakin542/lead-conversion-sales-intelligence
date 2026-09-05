import React from 'react';
import Card from '../common/Card';
import { leadActivitySummary } from '../../data/dashboardData';
import { Mail, MousePointer, FileCheck, Presentation } from 'lucide-react';

interface LeadActivitySummaryProps {
  counters?: {
    total_calls?: number;
    total_emails?: number;
    total_meetings?: number;
    total_notes?: number;
  };
}

export const LeadActivitySummary: React.FC<LeadActivitySummaryProps> = ({ counters }) => {
  const getIcon = (title: string) => {
    if (title.includes('Email')) return <Mail className="w-4 h-4 text-blue-400" />;
    if (title.includes('Call')) return <MousePointer className="w-4 h-4 text-purple-400" />;
    if (title.includes('Meeting')) return <Presentation className="w-4 h-4 text-amber-400" />;
    return <FileCheck className="w-4 h-4 text-emerald-400" />;
  };

  const items = counters ? [
    { title: 'Customer Emails', count: (counters.total_emails ?? 0).toString(), change: '+12.4%' },
    { title: 'Phone Calls', count: (counters.total_calls ?? 0).toString(), change: '+8.1%' },
    { title: 'Team Meetings', count: (counters.total_meetings ?? 0).toString(), change: '+15.2%' },
    { title: 'Notes & Logs', count: (counters.total_notes ?? 0).toString(), change: '+4.9%' },
  ] : leadActivitySummary;

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white tracking-tight">Lead Activity Summary</h3>
        <p className="text-xs text-zinc-400">Real-time team engagement metrics</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.title} className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400">{item.title}</span>
              {getIcon(item.title)}
            </div>
            <p className="text-xl font-bold text-white">{item.count}</p>
            <span className="text-[10px] font-bold text-emerald-400">{item.change} vs last mo.</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LeadActivitySummary;

