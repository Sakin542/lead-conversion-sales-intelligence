import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { salesRepApi } from '../../services/api';
import { Flame, AlertTriangle, Clock, ArrowRight, Sparkles } from 'lucide-react';

export const SalesRepPriorityLeads: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPriorityLeads = async () => {
    setLoading(true);
    try {
      const res = await salesRepApi.getPriorityLeads();
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
    fetchPriorityLeads();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Flame className="w-7 h-7 text-amber-400" />
              <span>Priority Lead Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Focus on high-probability leads, urgent follow-ups, and overdue tasks to maximize conversion.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* HOT LEADS */}
            <Card className="p-5 bg-slate-900/80 border-slate-800 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>HOT Leads (Score &ge; 80)</span>
                  </h3>
                  <Badge variant="warning" size="sm">Immediate Action</Badge>
                </div>

                {data?.hot_leads?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No HOT leads assigned currently.</p>
                ) : (
                  <div className="space-y-3">
                    {data?.hot_leads?.map((l: any) => (
                      <div key={l.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-white">{l.first_name} {l.last_name}</p>
                          <p className="text-xs text-slate-400">{l.company} • {l.email}</p>
                          <p className="text-[11px] text-amber-400/90 font-semibold mt-1">Reason: High Intent AI Score ({l.score}/100)</p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/sales-rep/leads/${l.id}`)}
                          className="bg-indigo-600 border-none font-bold text-xs"
                        >
                          Execute <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* HIGH PRIORITY LEADS */}
            <Card className="p-5 bg-slate-900/80 border-slate-800 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>High Priority Prospects (Score 65+)</span>
                  </h3>
                  <Badge variant="primary" size="sm">High Intent</Badge>
                </div>

                {data?.high_priority_leads?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No high priority prospects currently.</p>
                ) : (
                  <div className="space-y-3">
                    {data?.high_priority_leads?.map((l: any) => (
                      <div key={l.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-white">{l.first_name} {l.last_name}</p>
                          <p className="text-xs text-slate-400">{l.company} • {l.email}</p>
                          <p className="text-[11px] text-indigo-400 font-semibold mt-1">Reason: Elevated Conversion Probability</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/sales-rep/leads/${l.id}`)}
                          className="border-indigo-800 text-indigo-300 text-xs"
                        >
                          View Lead <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* FOLLOW-UP DUE TODAY */}
            <Card className="p-5 bg-slate-900/80 border-slate-800 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Follow-up Due Today</span>
                  </h3>
                  <Badge variant="primary" size="sm">Due Today</Badge>
                </div>

                {data?.followup_due_today?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No follow-ups due today.</p>
                ) : (
                  <div className="space-y-3">
                    {data?.followup_due_today?.map((f: any) => (
                      <div key={f.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-white">{f.lead ? `${f.lead.first_name} ${f.lead.last_name}` : 'Follow-up Task'}</p>
                          <p className="text-xs text-slate-400">{f.notes || 'Scheduled outreach due today'}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/sales-rep/follow-ups')}
                          className="border-cyan-800 text-cyan-300 text-xs"
                        >
                          Open Schedule
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* OVERDUE FOLLOW-UPS */}
            <Card className="p-5 bg-slate-900/80 border-slate-800 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Overdue Follow-up Reminders</span>
                  </h3>
                  <Badge variant="danger" size="sm">Overdue</Badge>
                </div>

                {data?.overdue_followups?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No overdue follow-up tasks.</p>
                ) : (
                  <div className="space-y-3">
                    {data?.overdue_followups?.map((f: any) => (
                      <div key={f.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-white">{f.lead ? `${f.lead.first_name} ${f.lead.last_name}` : 'Follow-up Task'}</p>
                          <p className="text-xs text-rose-400 font-semibold">{f.notes || 'Overdue task requiring immediate completion'}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/sales-rep/follow-ups')}
                          className="border-rose-900 text-rose-300 hover:bg-rose-950/60 text-xs"
                        >
                          Resolve Now
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesRepPriorityLeads;
