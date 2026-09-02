import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { salesRepApi } from '../../services/api';
import { Calendar, CheckCircle2 } from 'lucide-react';

export const SalesRepFollowUps: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed'>('today');

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await salesRepApi.getFollowUps();
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleComplete = async (id: number) => {
    try {
      const res = await salesRepApi.completeFollowUp(id);
      if (res.success) {
        fetchFollowUps();
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to complete follow-up.');
    }
  };

  const getActiveList = () => {
    if (!data) return [];
    return data[activeTab] || [];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Calendar className="w-7 h-7 text-indigo-400" />
              <span>Follow-up Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage scheduled reminders, overdue outreach, and completed prospect check-ins.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'today'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Today ({data?.today?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Upcoming ({data?.upcoming?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'overdue'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Overdue ({data?.overdue?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'completed'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Completed ({data?.completed?.length || 0})
          </button>
        </div>

        {/* List Content */}
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : getActiveList().length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">No follow-up items in this view.</p>
          ) : (
            <div className="space-y-3">
              {getActiveList().map((f: any) => (
                <div key={f.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-white">
                      {f.lead ? `${f.lead.first_name} ${f.lead.last_name} (${f.lead.company})` : 'Follow-up Task'}
                    </p>
                    <p className="text-xs text-slate-300">{f.notes || 'Scheduled follow-up reminder'}</p>
                    <p className="text-[11px] text-slate-400">
                      Scheduled: {new Date(f.scheduled_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {f.status !== 'completed' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleComplete(f.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 border-none font-bold text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                      </Button>
                    ) : (
                      <Badge variant="success" size="sm">Completed</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SalesRepFollowUps;
