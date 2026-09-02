import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { salesRepApi } from '../../services/api';
import { Phone } from 'lucide-react';

export const SalesRepActivities: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { per_page: '30' };
      if (typeFilter) params.type = typeFilter;
      const res = await salesRepApi.getActivities(params);
      if (res.success) {
        setActivities(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [typeFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Phone className="w-7 h-7 text-indigo-400" />
              <span>Activity &amp; Outreach Timeline</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Complete chronological audit of your calls, emails, demos, and meeting interactions with assigned leads.
            </p>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded-xl px-3 py-2"
          >
            <option value="">All Activity Types</option>
            <option value="call">Calls</option>
            <option value="email">Emails</option>
            <option value="meeting">Meetings</option>
            <option value="demo">Product Demos</option>
            <option value="note">Notes</option>
            <option value="proposal">Proposals</option>
          </select>
        </div>

        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">No recorded outreach activities found.</p>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="primary" size="sm" className="uppercase font-bold">
                        {a.activity_type || a.type}
                      </Badge>
                      <span className="text-xs font-extrabold text-white">
                        {a.lead ? `${a.lead.first_name} ${a.lead.last_name} (${a.lead.company})` : 'Assigned Lead'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{a.description || a.notes}</p>
                    <p className="text-[10px] text-slate-500">{new Date(a.created_at).toLocaleString()}</p>
                  </div>

                  {a.outcome && (
                    <Badge variant={a.outcome === 'Interested' || a.outcome === 'Sent' ? 'success' : 'neutral'} size="sm">
                      {a.outcome}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SalesRepActivities;
