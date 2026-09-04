import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { managerApi, userManagementApi } from '../../services/api';
import { User } from '../../types/auth';
import { Target, Plus, Trash2, RefreshCw } from 'lucide-react';

export const ManagerGoals: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [salesReps, setSalesReps] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalType, setGoalType] = useState('revenue');
  const [targetValue, setTargetValue] = useState<number>(100000);
  const [timeframe, setTimeframe] = useState('monthly');
  const [selectedRepId, setSelectedRepId] = useState<string>('');
  const [startDate, setStartDate] = useState(nowFirstOfMonth());
  const [endDate, setEndDate] = useState(nowEndOfMonth());
  const [isSaving, setIsSaving] = useState(false);

  function nowFirstOfMonth() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  }

  function nowEndOfMonth() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  const fetchGoalsData = async () => {
    setLoading(true);
    try {
      const [gRes, uRes] = await Promise.all([
        managerApi.getGoals(),
        userManagementApi.getUsers(),
      ]);

      if (gRes.success) {
        setGoals(gRes.goals);
        setSummary(gRes.team_summary);
      }
      if (uRes.success) {
        setSalesReps(uRes.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsData();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await managerApi.createGoal({
        type: goalType,
        target_value: Number(targetValue),
        timeframe,
        user_id: selectedRepId ? Number(selectedRepId) : null,
        start_date: startDate,
        end_date: endDate,
      });

      if (res.success) {
        setIsModalOpen(false);
        fetchGoalsData();
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to create goal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!window.confirm('Delete this goal target?')) return;
    try {
      const res = await managerApi.deleteGoal(id);
      if (res.success) {
        setGoals((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to delete goal.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Excellent':
        return <Badge variant="success" size="sm">🔥 Excellent</Badge>;
      case 'On Track':
        return <Badge variant="primary" size="sm">On Track</Badge>;
      default:
        return <Badge variant="warning" size="sm">At Risk</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Target className="w-7 h-7 text-[#FF7A00]" />
              <span>Team Goals & Sales Targets</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Define team-wide and individual sales rep targets, tracking real database progress metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGoalsData}
              className="border-[#2A2A2E] text-zinc-300 hover:bg-[#29292C] hover:text-white"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="ai"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="font-bold"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Goal / Target
            </Button>
          </div>
        </div>

        {/* Team Revenue Goal Highlight Card */}
        {summary && (
          <Card className="p-6 bg-[#171718] border-[#2A2A2E] space-y-4 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Team Revenue Target</span>
              <Badge variant="primary" size="md">Monthly Overview</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Target Goal</span>
                <p className="text-2xl font-black text-white">${summary.revenue_target.toLocaleString()}</p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Achieved</span>
                <p className="text-2xl font-black text-emerald-400">${summary.achieved_revenue.toLocaleString()}</p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Progress</span>
                <p className="text-2xl font-black text-[#FF7A00]">{summary.progress_percentage}%</p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Remaining</span>
                <p className="text-2xl font-black text-zinc-300">${summary.remaining.toLocaleString()}</p>
              </div>
            </div>

            <div className="w-full bg-[#111113] rounded-full h-3 border border-[#2A2A2E] overflow-hidden">
              <div
                className="bg-[#FF7A00] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.progress_percentage)}%` }}
              />
            </div>
          </Card>
        )}

        {/* Goals & Targets Table */}
        <Card className="p-5 bg-[#171718] border-[#2A2A2E] space-y-4 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-white">Active Goals & Targets Directory</h3>

          <div className="w-full min-w-0 overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[650px] text-left text-xs text-zinc-300">
              <thead className="bg-[#111113] text-zinc-400 font-semibold uppercase tracking-wider border-b border-[#2A2A2E]">
                <tr>
                  <th className="px-4 py-3">Assignee / Title</th>
                  <th className="px-4 py-3">Metric Type</th>
                  <th className="px-4 py-3">Target Goal</th>
                  <th className="px-4 py-3">Achieved</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : goals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      No active goal targets created yet. Click "Create Goal / Target" above.
                    </td>
                  </tr>
                ) : (
                  goals.map((g) => (
                    <tr key={g.id} className="hover:bg-[#1C1C1E] transition-colors">
                      <td className="px-4 py-3 font-bold text-white">
                        {g.title}
                        <span className="block text-[10px] text-zinc-400 font-normal">{g.timeframe}</span>
                      </td>
                      <td className="px-4 py-3 uppercase font-semibold text-[#FF7A00]">{g.type.replace('_', ' ')}</td>
                      <td className="px-4 py-3 font-bold text-white">
                        {g.type === 'revenue' ? `$${g.target_value.toLocaleString()}` : g.target_value}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-400">
                        {g.type === 'revenue' ? `$${g.achieved_value.toLocaleString()}` : g.achieved_value}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-24 bg-[#111113] rounded-full h-2 border border-[#2A2A2E] overflow-hidden">
                          <div
                            className="bg-[#FF7A00] h-full rounded-full"
                            style={{ width: `${Math.min(100, g.progress)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 mt-0.5 block">{g.progress}%</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(g.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteGoal(g.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create Goal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Goal / Target">
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Select
            label="Goal Type"
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
            options={[
              { value: 'revenue', label: 'Revenue ($ Target)' },
              { value: 'converted_leads', label: 'Converted Leads Count' },
              { value: 'leads', label: 'Total Leads Handled' },
              { value: 'qualified_leads', label: 'Qualified Leads Count' },
              { value: 'conversion_rate', label: 'Conversion Rate (%)' },
              { value: 'follow_ups', label: 'Completed Follow-ups' },
            ]}
          />

          <Input
            label="Target Value"
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(Number(e.target.value))}
            required
          />

          <Select
            label="Target Timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
            ]}
          />

          <Select
            label="Assignee"
            value={selectedRepId}
            onChange={(e) => setSelectedRepId(e.target.value)}
            options={[
              { value: '', label: 'Entire Team (Team Goal)' },
              ...salesReps.map((r) => ({ value: String(r.id), label: `${r.name} (${r.role.replace('_', ' ')})` })),
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-[#2A2A2E]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="ai" size="sm" isLoading={isSaving} className="font-bold">
              Save Target Goal
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ManagerGoals;

