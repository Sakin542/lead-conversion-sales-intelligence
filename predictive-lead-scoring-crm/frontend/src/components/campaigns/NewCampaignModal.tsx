import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import { Megaphone, DollarSign, Calendar, Rocket, Sparkles } from 'lucide-react';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCampaign: any) => void;
}

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    channel: 'Email',
    budget: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.budget) return;

    const newCamp = {
      id: `camp-${Date.now()}`,
      name: formData.name,
      channel: formData.channel,
      status: 'Active',
      budget: Number(formData.budget),
      spent: 0,
      leadsGenerated: 0,
      conversionRate: 0,
      roi: '1.0x',
      startDate: formData.startDate || '2026-09-01',
      endDate: formData.endDate || '2026-12-31',
    };

    onSuccess(newCamp);
    onClose();
    setFormData({ name: '', channel: 'Email', budget: '', startDate: '', endDate: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Marketing Campaign" size="2xl">
      <form onSubmit={handleSubmit} className="space-y-5 text-zinc-100">
        <div className="p-3.5 bg-[#FF7A00]/10 border border-[#FF7A00]/30 rounded-xl flex items-center space-x-3 text-xs text-[#FF8C1A]">
          <Sparkles className="w-4 h-4 shrink-0 text-[#FF7A00]" />
          <span>Launch acquisition campaigns with automatic lead source tracking and conversion ROI attribution.</span>
        </div>

        <div>
          <Input
            label="Campaign Name *"
            type="text"
            placeholder="e.g. Q4 Executive Product Launch"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            leftIcon={<Megaphone className="w-4 h-4 text-zinc-400" />}
            required
            className="min-h-[44px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Marketing Acquisition Channel *"
            value={formData.channel}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, channel: e.target.value })}
            options={[
              { value: 'Email', label: 'Email Outreach' },
              { value: 'LinkedIn', label: 'LinkedIn Ads' },
              { value: 'Google Ads', label: 'Google Search Ads' },
              { value: 'Webinar', label: 'Webinar Series' },
              { value: 'Cold Outbound', label: 'Cold Outbound' },
            ]}
          />

          <Input
            label="Total Allocated Budget ($) *"
            type="number"
            placeholder="e.g. 10000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            leftIcon={<DollarSign className="w-4 h-4 text-zinc-400" />}
            required
            className="min-h-[44px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Campaign Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            leftIcon={<Calendar className="w-4 h-4 text-zinc-400" />}
            className="min-h-[44px] [color-scheme:dark]"
          />

          <Input
            label="Campaign End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            leftIcon={<Calendar className="w-4 h-4 text-zinc-400" />}
            className="min-h-[44px] [color-scheme:dark]"
          />
        </div>

        <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[#2A2A2E]">
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="ai"
            size="md"
            type="submit"
            leftIcon={<Rocket className="w-4 h-4" />}
            className="font-bold shadow-lg shadow-[#FF7A00]/25"
          >
            Launch Campaign
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewCampaignModal;
