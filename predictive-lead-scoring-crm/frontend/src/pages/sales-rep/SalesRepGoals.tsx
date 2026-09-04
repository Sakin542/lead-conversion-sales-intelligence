import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { salesRepApi } from '../../services/api';
import { Target } from 'lucide-react';

export const SalesRepGoals: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await salesRepApi.getGoals();
      if (res && res.success && Array.isArray(res.goals)) {
        setGoals(res.goals);
      } else {
        setGoals([]);
      }
    } catch (e) {
      console.error(e);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Target className="w-7 h-7 text-[#FF7A00]" />
              <span>Assigned Sales Goals</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Track manager-assigned performance quotas, revenue targets, and milestone progress.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : goals.length === 0 ? (
          <Card className="p-10 bg-[#171718] border-[#2A2A2E] text-center space-y-2">
            <Target className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-bold text-zinc-300">No active goals assigned yet.</p>
            <p className="text-xs text-zinc-500">Your manager will assign performance targets here.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((g) => (
              <Card key={g.id} className="p-5 bg-[#171718] border-[#2A2A2E] flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{g.title}</h3>
                    <p className="text-[11px] text-zinc-400">Target Type: {g.type}</p>
                  </div>
                  <Badge variant={g.status === 'Achieved' ? 'success' : g.status === 'On Track' ? 'primary' : 'warning'} size="sm">
                    {g.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-[#111113] rounded-xl border border-[#2A2A2E]">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase">Target</span>
                    <span className="font-black text-white">{g.target.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-[#111113] rounded-xl border border-[#2A2A2E]">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase">Achieved</span>
                    <span className="font-black text-emerald-400">{g.achieved.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-[#111113] rounded-xl border border-[#2A2A2E]">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase">Remaining</span>
                    <span className="font-black text-[#FF7A00]">{g.remaining.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-zinc-300">
                    <span>Progress Percentage</span>
                    <span className="text-[#FF7A00]">{g.progress}</span>
                  </div>
                  <div className="w-full bg-[#111113] rounded-full h-2.5 border border-[#2A2A2E] overflow-hidden">
                    <div
                      className="bg-[#FF7A00] h-full rounded-full transition-all duration-500"
                      style={{ width: g.progress }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesRepGoals;
