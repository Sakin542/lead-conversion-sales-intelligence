import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { salesRepApi } from '../../services/api';
import { Briefcase, ArrowRight, RefreshCw } from 'lucide-react';

export const SalesRepPipeline: React.FC = () => {
  const [pipeline, setPipeline] = useState<Record<string, any>>({});
  const [totalValue, setTotalValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Stage Change Modal State
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [newStage, setNewStage] = useState('contacted');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await salesRepApi.getPipeline();
      if (res.success) {
        setPipeline(res.pipeline || {});
        setTotalValue(res.total_pipeline_value || 0);
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

  const handleUpdateStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setIsUpdating(true);
    try {
      const res = await salesRepApi.updatePipelineStage(selectedLead.id, newStage);
      if (res.success) {
        setSelectedLead(null);
        fetchPipeline();
      }
    } catch (err: any) {
      alert(err.data?.message || err.message || 'Failed to update pipeline stage.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A2E] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-[#FF7A00]" />
              <span>Personal Sales Pipeline</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Visual Kanban board of your active deals and lead progression stages.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-1.5 bg-[#111113] border border-[#2A2A2E] rounded-xl text-xs font-semibold text-zinc-300">
              Active Value: <span className="text-emerald-400 font-bold">${totalValue.toLocaleString()}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPipeline}
              className="border-[#2A2A2E] text-zinc-300 hover:bg-[#1C1C1E]"
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 overflow-x-auto pb-4 custom-scrollbar">
            {Object.keys(pipeline).map((key) => {
              const stage = pipeline[key];
              return (
                <div key={key} className="bg-[#171718] border border-[#2A2A2E] rounded-xl p-3 space-y-3 min-w-[200px]">
                  <div className="border-b border-[#2A2A2E] pb-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">{stage.name}</span>
                    <Badge variant="primary" size="sm">{stage.items?.length || 0}</Badge>
                  </div>

                  <p className="text-[10px] font-medium text-zinc-400">
                    Est: ${(stage.stage_value || 0).toLocaleString()}
                  </p>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {stage.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 bg-[#111113] rounded-xl border border-[#2A2A2E] space-y-2 hover:border-[#FF7A00]/40 transition-colors"
                      >
                        <p className="text-xs font-bold text-white truncate">{item.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{item.company}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-bold text-emerald-400">${item.value.toLocaleString()}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLead(item);
                              setNewStage(item.status);
                            }}
                            className="text-[10px] py-0.5 px-2 border-[#2A2A2E] text-[#FF7A00] hover:bg-[#1C1C1E]"
                          >
                            Move <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Update Pipeline Stage Modal */}
        {selectedLead && (
          <Modal
            isOpen={!!selectedLead}
            onClose={() => setSelectedLead(null)}
            title={`Move Pipeline Stage: ${selectedLead.title}`}
          >
            <form onSubmit={handleUpdateStageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Stage</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full bg-[#111113] border border-[#2A2A2E] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#FF7A00] transition-colors"
                >
                  <option value="new">NEW LEADS</option>
                  <option value="contacted">CONTACTED</option>
                  <option value="qualified">QUALIFIED</option>
                  <option value="proposal">PROPOSAL SENT</option>
                  <option value="negotiation">NEGOTIATION</option>
                  <option value="won">CLOSED WON</option>
                  <option value="lost">CLOSED LOST</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-3 border-t border-[#2A2A2E]">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedLead(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="ai" size="sm" isLoading={isUpdating}>
                  Update Stage
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesRepPipeline;
