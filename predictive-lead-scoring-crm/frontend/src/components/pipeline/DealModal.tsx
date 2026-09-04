import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { Deal, DealFormData, PipelineStage } from '../../types/pipeline';
import { Lead } from '../../types/lead';
import { AlertCircle, Plus } from 'lucide-react';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: DealFormData) => Promise<void>;
  initialStageId?: number;
  editingDeal?: Deal | null;
  leads: Lead[];
  stages: PipelineStage[];
}

export const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialStageId,
  editingDeal,
  leads,
  stages,
}) => {
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    lead_id: leads[0]?.id || 0,
    pipeline_stage_id: initialStageId || stages[0]?.id || 0,
    value: 10000,
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    probability: 50,
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingDeal) {
      setFormData({
        title: editingDeal.title,
        lead_id: editingDeal.lead_id,
        pipeline_stage_id: editingDeal.pipeline_stage_id,
        value: editingDeal.value,
        expected_close_date: editingDeal.expected_close_date
          ? editingDeal.expected_close_date.split('T')[0]
          : '',
        probability: editingDeal.probability,
        notes: editingDeal.notes || '',
      });
    } else {
      setFormData({
        title: '',
        lead_id: leads[0]?.id || 0,
        pipeline_stage_id: initialStageId || stages[0]?.id || 0,
        value: 10000,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        probability: 50,
        notes: '',
      });
    }
  }, [editingDeal, initialStageId, leads, stages, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.lead_id || !formData.pipeline_stage_id) {
      setError('Title, lead, and stage are required.');
      return;
    }

    if (formData.probability < 0 || formData.probability > 100) {
      setError('Probability must be between 0 and 100.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        lead_id: Number(formData.lead_id),
        pipeline_stage_id: Number(formData.pipeline_stage_id),
        value: Number(formData.value),
        probability: Number(formData.probability),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save deal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingDeal ? 'Edit Deal' : 'Create New Deal'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Deal Title <span className="text-rose-400">*</span>
          </label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Enterprise License Agreement"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Associated Lead <span className="text-rose-400">*</span>
            </label>
            <select
              name="lead_id"
              value={formData.lead_id}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 min-h-[42px] bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors"
              required
            >
              {leads.length === 0 ? (
                <option value={0}>No leads available (Add lead first)</option>
              ) : (
                leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.first_name} {l.last_name} ({l.company})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Pipeline Stage <span className="text-rose-400">*</span>
            </label>
            <select
              name="pipeline_stage_id"
              value={formData.pipeline_stage_id}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 min-h-[42px] bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors"
              required
            >
              {stages.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Deal Value ($)
            </label>
            <Input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="e.g. 25000"
              min="0"
              step="500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Win Probability (%)
            </label>
            <Input
              type="number"
              name="probability"
              value={formData.probability}
              onChange={handleChange}
              placeholder="50"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Expected Close Date
            </label>
            <Input
              type="date"
              name="expected_close_date"
              value={formData.expected_close_date || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Deal Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Add key decision makers, proposal links, next steps..."
            className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors custom-scrollbar"
          />
        </div>

        {/* Modal Footer Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#222222]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={!editingDeal ? <Plus className="w-4 h-4" /> : undefined}
            className="min-w-[130px]"
          >
            {editingDeal ? 'Save Changes' : 'Create Deal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DealModal;
