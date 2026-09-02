import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import { GitCommitHorizontal, RefreshCw, User } from 'lucide-react';

export const AdminPipeline: React.FC = () => {
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const STAGES = [
    { key: 'new', label: 'NEW', color: 'border-cyan-500' },
    { key: 'contacted', label: 'CONTACTED', color: 'border-indigo-500' },
    { key: 'qualified', label: 'QUALIFIED', color: 'border-purple-500' },
    { key: 'proposal', label: 'PROPOSAL', color: 'border-amber-500' },
    { key: 'negotiation', label: 'NEGOTIATION', color: 'border-orange-500' },
    { key: 'won', label: 'WON', color: 'border-emerald-500' },
    { key: 'lost', label: 'LOST', color: 'border-rose-500' },
  ];

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLeads({ per_page: '100' });
      if (res.success) {
        setPipelineData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const getStageTotal = (stageKey: string) => {
    return pipelineData
      .filter((l) => (l.status || 'new').toLowerCase() === stageKey)
      .reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-950 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <GitCommitHorizontal className="w-7 h-7 text-indigo-400" />
              <span>Sales Pipeline Kanban Board</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Complete multi-stage deal funnel oversight across all sales representatives.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPipeline}
            className="border-slate-800 text-slate-300 hover:bg-slate-900"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Pipeline
          </Button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {STAGES.map((stage) => {
              const stageLeads = pipelineData.filter(
                (l) => (l.status || 'new').toLowerCase() === stage.key
              );
              const stageTotalValue = getStageTotal(stage.key);

              return (
                <div
                  key={stage.key}
                  className={`w-72 shrink-0 bg-slate-900/80 border-t-4 ${stage.color} border-x border-b border-slate-800 rounded-2xl p-3 flex flex-col max-h-[75vh]`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-xs font-black text-white tracking-wider">{stage.label}</h3>
                      <span className="text-[10px] text-slate-400 font-semibold">{stageLeads.length} Deals</span>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-400">
                      ${stageTotalValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto pt-3 space-y-3 custom-scrollbar pr-1">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-slate-600 border border-dashed border-slate-800 rounded-xl">
                        No deals in stage
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <Card key={lead.id} className="p-3 bg-slate-950/80 border-slate-800 space-y-2 hover:border-indigo-500/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <p className="text-xs font-bold text-white leading-tight">
                              {lead.first_name} {lead.last_name}
                            </p>
                            <span className="text-[10px] font-bold text-emerald-400">
                              ${(lead.estimated_value || 0).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 leading-none">{lead.company || 'N/A'}</p>

                          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                            <span className="text-indigo-400 font-semibold flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {lead.assigned_to_user ? lead.assigned_to_user.name : 'Unassigned'}
                            </span>
                            <span className="text-amber-400 font-bold">Score: {lead.score ?? 0}</span>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPipeline;

