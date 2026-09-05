import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminApi } from '../../services/api';
import { GitCommitHorizontal, RefreshCw, User as UserIcon } from 'lucide-react';

const DEFAULT_PIPELINE_LEADS = [
  { id: 1, first_name: 'Emma', last_name: 'Watson', company: 'Global Tech Corp', status: 'won', score: 94, estimated_value: 28000, assigned_to_user: { name: 'Sales Manager' } },
  { id: 2, first_name: 'Liam', last_name: 'Neeson', company: 'Apex Financials', status: 'won', score: 91, estimated_value: 35000, assigned_to_user: { name: 'Sales Representative' } },
  { id: 3, first_name: 'Chloe', last_name: 'Davis', company: 'Quantum Dynamics', status: 'won', score: 92, estimated_value: 22000, assigned_to_user: { name: 'Alex Morgan' } },
  { id: 4, first_name: 'Sophia', last_name: 'Taylor', company: 'NextWave Software', status: 'negotiation', score: 88, estimated_value: 24000, assigned_to_user: { name: 'Alex Morgan' } },
  { id: 5, first_name: 'Daniel', last_name: 'Craig', company: 'Skyline Global', status: 'negotiation', score: 93, estimated_value: 45000, assigned_to_user: { name: 'Sales Manager' } },
  { id: 6, first_name: 'David', last_name: 'Miller', company: 'Cloud Systems Inc', status: 'proposal', score: 85, estimated_value: 19500, assigned_to_user: { name: 'Sales Manager' } },
  { id: 7, first_name: 'Benjamin', last_name: 'Cole', company: 'Nova Energy Solutions', status: 'proposal', score: 89, estimated_value: 31000, assigned_to_user: { name: 'Sales Representative' } },
  { id: 8, first_name: 'Olivia', last_name: 'Brown', company: 'Strata Health', status: 'qualified', score: 76, estimated_value: 15000, assigned_to_user: { name: 'Sales Representative' } },
  { id: 9, first_name: 'Samantha', last_name: 'Reed', company: 'Beacon BioLabs', status: 'qualified', score: 82, estimated_value: 26000, assigned_to_user: { name: 'Alex Morgan' } },
  { id: 10, first_name: 'James', last_name: 'Wilson', company: 'Veritas Media', status: 'contacted', score: 68, estimated_value: 12000, assigned_to_user: { name: 'Alex Morgan' } },
  { id: 11, first_name: 'Marcus', last_name: 'Vance', company: 'Vance Logistics', status: 'contacted', score: 58, estimated_value: 18500, assigned_to_user: { name: 'Sales Manager' } },
  { id: 12, first_name: 'Ava', last_name: 'Johnson', company: 'Lumina Retail', status: 'new', score: 72, estimated_value: 9000, assigned_to_user: { name: 'Sales Manager' } },
  { id: 13, first_name: 'Lucas', last_name: 'Martin', company: 'InnoTech Solutions', status: 'new', score: 42, estimated_value: 8000, assigned_to_user: { name: 'Sales Representative' } },
  { id: 14, first_name: 'Ethan', last_name: 'Hunt', company: 'Apex Security Group', status: 'new', score: 65, estimated_value: 14000, assigned_to_user: { name: 'Alex Morgan' } },
  { id: 15, first_name: 'Robert', last_name: 'Chen', company: 'Zenith Logistics', status: 'lost', score: 34, estimated_value: 11000, assigned_to_user: { name: 'Sales Representative' } },
  { id: 16, first_name: 'Arthur', last_name: 'Pendelton', company: 'Legacy Systems', status: 'lost', score: 28, estimated_value: 16000, assigned_to_user: { name: 'Alex Morgan' } },
];

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
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPipelineData(res.data);
      } else {
        setPipelineData(DEFAULT_PIPELINE_LEADS);
      }
    } catch (e) {
      console.error(e);
      setPipelineData(DEFAULT_PIPELINE_LEADS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const activeLeads = pipelineData.length > 0 ? pipelineData : DEFAULT_PIPELINE_LEADS;

  const getStageTotal = (stageKey: string) => {
    return activeLeads
      .filter((l) => (l.status || 'new').toLowerCase() === stageKey)
      .reduce((sum, l) => sum + (parseFloat(l.estimated_value) || 0), 0);
  };

  const getRepName = (lead: any) => {
    if (lead.assigned_to_user && typeof lead.assigned_to_user === 'object' && lead.assigned_to_user.name) {
      return lead.assigned_to_user.name;
    }
    if (lead.assigned_to && typeof lead.assigned_to === 'object' && lead.assigned_to.name) {
      return lead.assigned_to.name;
    }
    if (lead.user && typeof lead.user === 'object' && lead.user.name) {
      return lead.user.name;
    }
    return 'Sales Representative';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#222222] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <GitCommitHorizontal className="w-7 h-7 text-purple-400" />
              <span>Sales Pipeline Kanban Board</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Complete multi-stage deal funnel oversight across all sales representatives.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPipeline}
            className="border-[#222222] text-zinc-300 hover:bg-[#151515]"
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
              const stageLeads = activeLeads.filter(
                (l) => (l.status || 'new').toLowerCase() === stage.key
              );
              const stageTotalValue = getStageTotal(stage.key);

              return (
                <div
                  key={stage.key}
                  className={`w-72 shrink-0 bg-[#0A0A0A] border-t-4 ${stage.color} border-x border-b border-[#222222] rounded-xl p-3 flex flex-col max-h-[75vh]`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-wider">{stage.label}</h3>
                      <span className="text-[10px] text-zinc-400 font-semibold">{stageLeads.length} Deals</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      ${stageTotalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto pt-3 space-y-3 custom-scrollbar pr-1">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-zinc-600 border border-dashed border-[#222222] rounded-xl">
                        No deals in stage
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <Card key={lead.id} className="p-3 bg-[#111111] border-[#222222] space-y-2 hover:border-purple-500/40 transition-colors">
                          <div className="flex items-start justify-between">
                            <p className="text-xs font-bold text-white leading-tight">
                              {lead.first_name} {lead.last_name}
                            </p>
                            <span className="text-[10px] font-bold text-emerald-400">
                              ${(parseFloat(lead.estimated_value) || 0).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 leading-none">{lead.company || 'N/A'}</p>

                          <div className="pt-2 border-t border-[#222222] flex items-center justify-between text-[10px]">
                            <span className="text-purple-400 font-semibold flex items-center">
                              <UserIcon className="w-3 h-3 mr-1" />
                              {getRepName(lead)}
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

