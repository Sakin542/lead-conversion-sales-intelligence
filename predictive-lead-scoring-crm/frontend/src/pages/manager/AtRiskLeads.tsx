import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { managerApi } from '../../services/api';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export const AtRiskLeads: React.FC = () => {
  const navigate = useNavigate();
  const [atRiskLeads, setAtRiskLeads] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [riskFilter, setRiskFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const fetchAtRiskLeads = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (riskFilter) params.risk_level = riskFilter;
      if (stageFilter) params.stage = stageFilter;

      const res = await managerApi.getAtRiskLeads(params);
      if (res.success) {
        setAtRiskLeads(res.at_risk_leads);
        setSummary(res.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtRiskLeads();
  }, [riskFilter, stageFilter]);

  const handleResolveRisk = async (id: number) => {
    try {
      const res = await managerApi.resolveAtRiskLead(id);
      if (res.success) {
        setAtRiskLeads((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to resolve risk.');
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <Badge variant="danger" size="sm">🔥 CRITICAL</Badge>;
      case 'HIGH':
        return <Badge variant="warning" size="sm">⚠️ HIGH RISK</Badge>;
      case 'MEDIUM':
        return <Badge variant="primary" size="sm">MEDIUM RISK</Badge>;
      default:
        return <Badge variant="neutral" size="sm">LOW RISK</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-7 h-7 text-amber-400" />
              <span>Stale & At-Risk Lead Detection</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Automated system detection for inactive prospects, stuck pipeline deals, and missed follow-ups.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAtRiskLeads}
            className="border-slate-800 text-slate-300 hover:bg-slate-900"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Rescan System Risk
          </Button>
        </div>

        {/* Risk Level Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase">Critical Risks</span>
              <p className="text-2xl font-black text-rose-400">{summary.critical_count || 0}</p>
            </Card>

            <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase">High Risks</span>
              <p className="text-2xl font-black text-amber-400">{summary.high_count || 0}</p>
            </Card>

            <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase">Medium Risks</span>
              <p className="text-2xl font-black text-indigo-400">{summary.medium_count || 0}</p>
            </Card>

            <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total At-Risk</span>
              <p className="text-2xl font-black text-white">{summary.total_at_risk || 0}</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap gap-4">
          <div className="w-48">
            <Select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              options={[
                { value: '', label: 'All Risk Levels' },
                { value: 'CRITICAL', label: 'CRITICAL Only' },
                { value: 'HIGH', label: 'HIGH Only' },
                { value: 'MEDIUM', label: 'MEDIUM Only' },
                { value: 'LOW', label: 'LOW Only' },
              ]}
            />
          </div>

          <div className="w-48">
            <Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              options={[
                { value: '', label: 'All Stages' },
                { value: 'new', label: 'New' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'qualified', label: 'Qualified' },
                { value: 'proposal', label: 'Proposal' },
                { value: 'negotiation', label: 'Negotiation' },
              ]}
            />
          </div>
        </div>

        {/* At Risk Leads Table */}
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="w-full min-w-0 overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Lead & Company</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">Days Inactive</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Assigned Rep</th>
                  <th className="px-4 py-3">Risk Reason & Action</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : atRiskLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No at-risk leads detected matching current filters.
                    </td>
                  </tr>
                ) : (
                  atRiskLeads.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-white">
                        {item.lead_name}
                        <span className="block text-[11px] text-slate-400 font-normal">{item.company}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getRiskBadge(item.risk_level)}
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-400">
                        {item.days_inactive} Days
                      </td>
                      <td className="px-4 py-3 uppercase font-bold text-slate-300">
                        {item.pipeline_stage}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        {item.assigned_rep}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-slate-200">{item.risk_reason}</p>
                        <p className="text-[10px] text-indigo-400 mt-0.5">Recommended: {item.recommended_action}</p>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/leads/${item.id}`)}
                          className="text-[11px] py-1 border-slate-800 text-slate-300"
                        >
                          View Lead
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleResolveRisk(item.id)}
                          className="text-[11px] py-1 bg-emerald-600 border-none font-bold"
                        >
                          Resolve
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AtRiskLeads;

