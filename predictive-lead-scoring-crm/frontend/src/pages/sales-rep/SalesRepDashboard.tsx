import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { salesRepApi } from '../../services/api';
import {
  Users,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const SalesRepDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboard = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await salesRepApi.getDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const kpis = data?.kpis || {};
  const priorities = data?.priorities || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-[#FF7A00]" />
              <span>Sales Representative Workspace</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Personal lead execution, AI priorities, follow-up schedule, and pipeline progress.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/sales-rep/priority-leads')}
              className="border-[#2A2A2E] text-[#FF7A00] hover:bg-[#1C1C1E] hover:text-[#FF7A00]"
              leftIcon={<Flame className="w-4 h-4 text-[#FF7A00]" />}
            >
              Priority Leads
            </Button>
            <Button
              variant="ai"
              size="sm"
              onClick={() => navigate('/sales-rep/leads')}
            >
              My Leads Directory
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-[#171718] border-[#2A2A2E] flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">My Leads</span>
                  <Users className="w-5 h-5 text-[#FF7A00]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{kpis.my_leads || 0}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Assigned Accounts</p>
                </div>
              </Card>

              <Card className="p-4 bg-[#171718] border-[#2A2A2E] flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">HOT Leads</span>
                  <Flame className="w-5 h-5 text-[#FF7A00]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#FF7A00]">{kpis.hot_leads || 0}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Score &ge; 80 (High Intent)</p>
                </div>
              </Card>

              <Card className="p-4 bg-[#171718] border-[#2A2A2E] flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Follow-ups Today</span>
                  <Clock className="w-5 h-5 text-[#FF7A00]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#FF7A00]">{kpis.followups_today || 0}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Scheduled Actions</p>
                </div>
              </Card>

              <Card className="p-4 bg-[#171718] border-[#2A2A2E] flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Conversion Rate</span>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-400">{kpis.conversion_rate || '0%'}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Lead to Deal Ratio</p>
                </div>
              </Card>

              <Card className="p-4 bg-[#171718] border-[#2A2A2E] flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Deals Won</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-400">{kpis.deals_won || 0}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Closed Wins</p>
                </div>
              </Card>

              <Card className="p-4 bg-[#171718] border-[#2A2A2E] flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Revenue Won</span>
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-400">${(kpis.revenue || 0).toLocaleString()}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Closed Sales Value</p>
                </div>
              </Card>

              <Card className="p-4 bg-[#171718] border-[#2A2A2E] flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pipeline Value</span>
                  <Briefcase className="w-5 h-5 text-[#FF7A00]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#FF7A00]">${(kpis.pipeline_value || 0).toLocaleString()}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Active Deals Funnel</p>
                </div>
              </Card>

              <Card className="p-4 bg-[#171718] border-[#2A2A2E] flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Model</span>
                  <Sparkles className="w-5 h-5 text-[#FF7A00]" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white truncate">{kpis.active_model || 'XGBoost'}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">AI Scoring Engine</p>
                </div>
              </Card>
            </div>

            {/* Today's Priority Actions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hot Leads Requiring Contact */}
              <Card className="p-5 bg-[#171718] border-[#2A2A2E] flex flex-col justify-between h-full space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#FF7A00]" />
                      <span>HOT Leads Needing Action</span>
                    </h3>
                    <Badge variant="warning" size="sm">High Priority</Badge>
                  </div>

                  {priorities.hot_leads_no_contact?.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">No uncontacted HOT leads right now.</p>
                  ) : (
                    <div className="space-y-3">
                      {priorities.hot_leads_no_contact?.map((l: any) => (
                        <div key={l.id} className="p-3.5 bg-[#111113] rounded-xl border border-[#2A2A2E] flex items-center justify-between">
                          <div>
                            <p className="text-sm font-extrabold text-white">{l.first_name} {l.last_name}</p>
                            <p className="text-xs text-zinc-400">{l.company} • {l.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="warning" size="sm">Score: {l.score}</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/sales-rep/leads/${l.id}`)}
                              className="text-xs border-[#2A2A2E] text-zinc-300 hover:bg-[#1C1C1E] hover:text-white"
                            >
                              View Lead <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Overdue Follow-ups */}
              <Card className="p-5 bg-[#171718] border-[#2A2A2E] flex flex-col justify-between h-full space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Overdue Follow-up Reminders</span>
                    </h3>
                  </div>

                  {priorities.overdue_followups?.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">All follow-ups are up to date! Good job.</p>
                  ) : (
                    <div className="space-y-3">
                      {priorities.overdue_followups?.map((f: any) => (
                        <div key={f.id} className="p-3.5 bg-[#111113] rounded-xl border border-[#2A2A2E] flex items-center justify-between">
                          <div>
                            <p className="text-sm font-extrabold text-white">{f.lead ? `${f.lead.first_name} ${f.lead.last_name}` : 'Follow-up Task'}</p>
                            <p className="text-xs text-rose-400 font-semibold">{f.notes || 'Scheduled follow-up due'}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/sales-rep/follow-ups')}
                            className="text-xs border-rose-900/60 text-rose-400 hover:bg-rose-950/40"
                          >
                            Complete Task
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesRepDashboard;
