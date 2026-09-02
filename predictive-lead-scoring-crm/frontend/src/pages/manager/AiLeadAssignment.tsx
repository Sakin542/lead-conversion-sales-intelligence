import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { managerApi } from '../../services/api';
import { Bot, UserCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export const AiLeadAssignment: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAlternatives, setSelectedAlternatives] = useState<any | null>(null);

  const [assigningLeadId, setAssigningLeadId] = useState<number | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await managerApi.getAiAssignments();
      if (res.success) {
        setRecommendations(res.recommendations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleAssign = async (leadId: number, repId: number) => {
    setAssigningLeadId(leadId);
    try {
      const res = await managerApi.assignLeadAi(leadId, repId);
      if (res.success) {
        setRecommendations((prev) => prev.filter((r) => r.lead_id !== leadId));
        setSelectedAlternatives(null);
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to assign lead');
    } finally {
      setAssigningLeadId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Bot className="w-7 h-7 text-indigo-400" />
              <span>AI Lead Assignment Recommendation</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Transparent ML ranking matching incoming prospects with the best-fit Sales Representative.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecommendations}
            className="border-slate-800 text-slate-300 hover:bg-slate-900"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Recommendations
          </Button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : recommendations.length === 0 ? (
          <Card className="p-8 text-center bg-slate-900/80 border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">All Leads Currently Assigned</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no unassigned leads requiring AI assignment recommendations.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((item) => (
              <Card key={item.lead_id} className="p-6 bg-slate-900/90 border-slate-800 space-y-5">
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{item.lead_name}</h3>
                    <p className="text-xs text-slate-400">{item.company} • <span className="text-indigo-400">{item.email}</span></p>
                  </div>
                  <Badge variant="warning" size="sm">
                    Score: {item.score}
                  </Badge>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Recommended Rep</span>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                      Confidence: {item.confidence}%
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center">
                      {item.recommended_rep.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.recommended_rep.name}</h4>
                      <p className="text-[11px] text-slate-400">Workload: {item.current_workload} Active Leads • Rate: {item.historical_rate}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-900">
                    <p className="text-[11px] font-bold text-slate-300">Why this recommendation?</p>
                    {item.reasons.map((r: string, idx: number) => (
                      <p key={idx} className="text-[11px] text-slate-400 leading-snug">{r}</p>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAlternatives(item)}
                    className="text-xs border-slate-800 text-slate-300"
                  >
                    View Alternatives ({item.alternatives.length})
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={assigningLeadId === item.lead_id}
                    onClick={() => handleAssign(item.lead_id, item.recommended_rep.id)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 border-none font-bold"
                    leftIcon={<UserCheck className="w-4 h-4" />}
                  >
                    Assign Lead
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Alternatives Modal */}
      {selectedAlternatives && (
        <Modal
          isOpen={!!selectedAlternatives}
          onClose={() => setSelectedAlternatives(null)}
          title={`Alternative Reps for ${selectedAlternatives.lead_name}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Select another representative if you wish to override the AI top recommendation:
            </p>

            <div className="space-y-3">
              {selectedAlternatives.alternatives.map((alt: any) => (
                <div
                  key={alt.rep_id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{alt.rep_name}</p>
                    <p className="text-[11px] text-slate-400">Workload: {alt.workload} • Conv Rate: {alt.conversion_rate}%</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-indigo-400">{alt.confidence}% match</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAssign(selectedAlternatives.lead_id, alt.rep_id)}
                      className="text-xs bg-indigo-600 border-none font-bold"
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedAlternatives(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AiLeadAssignment;

