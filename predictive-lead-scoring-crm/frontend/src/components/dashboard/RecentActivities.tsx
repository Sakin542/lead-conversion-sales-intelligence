import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import { recentActivities as mockActivities } from '../../data/dashboardData';
import activityService from '../../services/activityService';
import { LeadActivity } from '../../types/lead';
import { Mail, Globe, FileText, MousePointer, PlayCircle, PhoneCall, Calendar, Activity } from 'lucide-react';

export const RecentActivities: React.FC = () => {
  const [realActivities, setRealActivities] = useState<LeadActivity[]>([]);

  useEffect(() => {
    activityService
      .getRecentActivities()
      .then((res) => {
        if (res.success && res.data) {
          setRealActivities(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email_open':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'page_visit':
        return <Globe className="w-4 h-4 text-indigo-400" />;
      case 'form_submission':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'email_click':
        return <MousePointer className="w-4 h-4 text-purple-400" />;
      case 'demo_request':
        return <PlayCircle className="w-4 h-4 text-emerald-400" />;
      case 'call':
        return <PhoneCall className="w-4 h-4 text-blue-400" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-rose-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-800/80 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Recent Activity</h3>
          </div>
          <p className="text-xs text-slate-400">Real-time buyer engagement feed</p>
        </div>
      </div>

      {/* Activity Stream */}
      <div className="space-y-4">
        {realActivities.length > 0 ? (
          realActivities.slice(0, 5).map((act) => (
            <div key={act.id} className="flex items-start space-x-3 text-xs">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                {getActivityIcon(act.type)}
              </div>

              <div className="flex-1 space-y-1 border-b border-slate-800/50 pb-3">
                <p className="text-slate-200 leading-snug">
                  <span className="font-bold text-white">
                    {act.lead ? `${act.lead.first_name} ${act.lead.last_name}` : 'Lead'}
                  </span>{' '}
                  <span className="text-slate-300">{act.description}</span>
                </p>
                {act.lead?.company && (
                  <p className="text-[11px] text-slate-400 font-mono">{act.lead.company}</p>
                )}
              </div>

              <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                {formatTimestamp(act.occurred_at || act.created_at)}
              </span>
            </div>
          ))
        ) : (
          mockActivities.map((act) => (
            <div key={act.id} className="flex items-start space-x-3 text-xs">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                <Activity className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex-1 space-y-1 border-b border-slate-800/50 pb-3">
                <p className="text-slate-200 leading-snug">
                  <span className="font-bold text-white">{act.user}</span>{' '}
                  <span className="text-slate-300">{act.action}</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono">{act.target}</p>
              </div>

              <span className="text-[11px] text-slate-400 shrink-0 font-medium">{act.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default RecentActivities;
