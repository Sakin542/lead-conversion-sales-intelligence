import React, { useState } from 'react';
import { LeadFormData, LeadStatus } from '../../types/lead';
import Button from '../common/Button';
import Input from '../common/Input';
import { AlertCircle } from 'lucide-react';

interface LeadFormProps {
  initialValues?: Partial<LeadFormData>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New Lead' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const SOURCE_OPTIONS = [
  { value: 'Website', label: 'Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Cold Call', label: 'Cold Call' },
  { value: 'Event', label: 'Event' },
  { value: 'Other', label: 'Other' },
];

const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1 - 10 employees' },
  { value: '11-50', label: '11 - 50 employees' },
  { value: '51-200', label: '51 - 200 employees' },
  { value: '201-500', label: '201 - 500 employees' },
  { value: '500+', label: '500+ employees' },
];

export const LeadForm: React.FC<LeadFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create Lead',
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<LeadFormData>({
    first_name: initialValues?.first_name || '',
    last_name: initialValues?.last_name || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    company: initialValues?.company || '',
    job_title: initialValues?.job_title || '',
    source: initialValues?.source || 'Website',
    status: initialValues?.status || 'new',
    industry: initialValues?.industry || '',
    company_size: initialValues?.company_size || '11-50',
    estimated_value: initialValues?.estimated_value || '',
    notes: initialValues?.notes || '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.company) {
      setError('First name, last name, email, and company are required.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err?.message || 'Failed to save lead. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            First Name <span className="text-rose-400">*</span>
          </label>
          <Input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="e.g. Sarah"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Last Name <span className="text-rose-400">*</span>
          </label>
          <Input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="e.g. Connor"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email Address <span className="text-rose-400">*</span>
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="sarah@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      {/* Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Company Name <span className="text-rose-400">*</span>
          </label>
          <Input
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g. Cyberdyne Systems"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job Title</label>
          <Input
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            placeholder="e.g. CTO / VP Engineering"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Industry</label>
          <Input
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="e.g. Software / Fintech"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Size</label>
          <select
            name="company_size"
            value={formData.company_size}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 min-h-[42px] bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {COMPANY_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deal / Lead Pipeline Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 min-h-[42px] bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Source</label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 min-h-[42px] bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estimated Value ($)</label>
          <Input
            type="number"
            name="estimated_value"
            value={formData.estimated_value}
            onChange={handleChange}
            placeholder="e.g. 50000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="pt-2 border-t border-slate-800/60">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lead Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Add background info, preferences, meeting summaries..."
          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors custom-scrollbar"
        />
      </div>

      {/* Footer Buttons: Cancel & Create Lead / Save Lead */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="min-w-[130px]"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
