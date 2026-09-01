import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PipelineSummary from '../components/pipeline/PipelineSummary';
import PipelineBoard from '../components/pipeline/PipelineBoard';
import DealModal from '../components/pipeline/DealModal';
import dealService from '../services/dealService';
import leadService from '../services/leadService';
import { Deal, DealFormData, PipelineStage, PipelineSummary as PipelineSummaryType } from '../types/pipeline';
import { Lead } from '../types/lead';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';

export const Pipeline: React.FC = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [summary, setSummary] = useState<PipelineSummaryType>({
    total_pipeline_value: 0,
    open_deals_count: 0,
    won_deals_count: 0,
    lost_deals_count: 0,
    total_deals_count: 0,
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isDealModalOpen, setIsDealModalOpen] = useState<boolean>(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [initialStageId, setInitialStageId] = useState<number | undefined>(undefined);

  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchPipelineData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pipeRes, leadsRes] = await Promise.all([
        dealService.getPipeline(),
        leadService.getLeads({ per_page: 100 }),
      ]);

      setStages(pipeRes.stages || []);
      setAllDeals(pipeRes.all_deals || []);
      setSummary(pipeRes.summary);
      setLeads(leadsRes.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const handleStageChange = async (dealId: number, newStageId: number) => {
    // Optimistic UI update
    setAllDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, pipeline_stage_id: newStageId } : d))
    );

    try {
      await dealService.updateDealStage(dealId, newStageId);
      // Quietly refresh summary
      const res = await dealService.getPipeline();
      setSummary(res.summary);
      setStages(res.stages || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to update deal stage');
      fetchPipelineData();
    }
  };

  const handleSaveDeal = async (formData: DealFormData) => {
    if (editingDeal) {
      await dealService.updateDeal(editingDeal.id, formData);
    } else {
      await dealService.createDeal(formData);
    }
    fetchPipelineData();
  };

  const handleDeleteDeal = async () => {
    if (!dealToDelete) return;
    setIsDeleting(true);
    try {
      await dealService.deleteDeal(dealToDelete.id);
      setDealToDelete(null);
      fetchPipelineData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete deal');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenAddDeal = (stageId?: number) => {
    setEditingDeal(null);
    setInitialStageId(stageId);
    setIsDealModalOpen(true);
  };

  const handleOpenEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setIsDealModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sales Pipeline</h1>
            <p className="text-xs text-slate-400">
              Track deal progress and revenue conversion across all 7 pipeline stages
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchPipelineData}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Pipeline"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <Button
              variant="primary"
              onClick={() => handleOpenAddDeal()}
              className="flex items-center space-x-2 shrink-0 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Deal</span>
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchPipelineData}
              className="text-xs text-rose-400 hover:text-white font-bold underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Pipeline Summary Header Cards */}
        <PipelineSummary summary={summary} />

        {/* Board Content */}
        {loading ? (
          <div className="py-24 text-center bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-xs text-slate-400 font-medium">Loading sales pipeline...</p>
          </div>
        ) : (
          <PipelineBoard
            stages={stages}
            allDeals={allDeals}
            onStageChange={handleStageChange}
            onEditDeal={handleOpenEditDeal}
            onDeleteDeal={(d) => setDealToDelete(d)}
            onAddDeal={(stageId) => handleOpenAddDeal(stageId)}
          />
        )}

        {/* Create / Edit Deal Modal */}
        <DealModal
          isOpen={isDealModalOpen}
          onClose={() => {
            setIsDealModalOpen(false);
            setEditingDeal(null);
          }}
          onSubmit={handleSaveDeal}
          initialStageId={initialStageId}
          editingDeal={editingDeal}
          leads={leads}
          stages={stages}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!dealToDelete}
          onClose={() => setDealToDelete(null)}
          title="Delete Deal"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete deal{' '}
              <strong className="text-white font-bold">{dealToDelete?.title}</strong>?
            </p>
            <p className="text-xs text-rose-400">This action cannot be undone.</p>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <Button
                variant="secondary"
                onClick={() => setDealToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteDeal}
                isLoading={isDeleting}
              >
                Delete Deal
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Pipeline;
