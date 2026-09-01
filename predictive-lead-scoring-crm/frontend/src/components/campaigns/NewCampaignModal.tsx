import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import { Megaphone, DollarSign, Calendar } from 'lucide-react';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Campaign">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200">
        <Input
          label="Campaign Name"
          type="text"
          placeholder="e.g. Q4 Executive Product Launch"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          leftIcon={<Megaphone className="w-4 h-4 text-slate-400" />}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Marketing Channel"
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
            label="Total Budget ($)"
            type="number"
            placeholder="10000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose} className="font-bold border-slate-700">
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
          >
            Launch Campaign
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewCampaignModal;
