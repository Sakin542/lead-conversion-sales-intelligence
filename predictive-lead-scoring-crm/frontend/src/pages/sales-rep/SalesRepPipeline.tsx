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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-indigo-400" />
              <span>Personal Sales Pipeline</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Visual Kanban board of your active deals and lead progression stages.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300">
              Active Value: <span className="text-emerald-400 font-extrabold">${totalValue.toLocaleString()}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPipeline}
              className="border-slate-800 text-slate-300 hover:bg-slate-900"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 overflow-x-auto pb-4">
            {Object.keys(pipeline).map((key) => {
              const stage = pipeline[key];
              return (
                <div key={key} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-3 min-w-[200px]">
                  <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">{stage.name}</span>
                    <Badge variant="primary" size="sm">{stage.items?.length || 0}</Badge>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400">
                    Est: ${(stage.stage_value || 0).toLocaleString()}
                  </p>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {stage.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 hover:border-indigo-800 transition-colors"
                      >
                        <p className="text-xs font-extrabold text-white truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{item.company}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-extrabold text-emerald-400">${item.value.toLocaleString()}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLead(item);
                              setNewStage(item.status);
                            }}
                            className="text-[10px] py-0.5 px-2 border-slate-800 text-indigo-300"
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
                <label className="block text-xs font-bold text-slate-300 mb-1">Target Stage</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
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

              <div className="pt-2 flex justify-end space-x-3 border-t border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedLead(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isUpdating} className="bg-indigo-600 border-none font-bold">
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
