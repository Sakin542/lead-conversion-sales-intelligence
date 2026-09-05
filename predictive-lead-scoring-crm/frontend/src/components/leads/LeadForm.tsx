import React, { useState } from 'react';
import { LeadFormData, LeadStatus } from '../../types/lead';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { AlertCircle, User, Mail, Phone, Building, Briefcase, DollarSign, FileText } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-6 text-zinc-200">
      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Contact Information */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <User className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>Primary Contact</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="e.g. Sarah"
            required
            className="min-h-[44px]"
          />

          <Input
            label="Last Name *"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="e.g. Connor"
            required
            className="min-h-[44px]"
          />

          <Input
            label="Email Address *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="sarah@example.com"
            leftIcon={<Mail className="w-4 h-4 text-zinc-500" />}
            required
            className="min-h-[44px]"
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            leftIcon={<Phone className="w-4 h-4 text-zinc-500" />}
            className="min-h-[44px]"
          />
        </div>
      </div>

      {/* 2. Organization & Firmographics */}
      <div className="space-y-3 pt-4 border-t border-[#222228]">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <Building className="w-3.5 h-3.5 text-sky-400" />
          <span>Organization Profile</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name *"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g. Cyberdyne Systems"
            required
            className="min-h-[44px]"
          />

          <Input
            label="Job Title"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            placeholder="e.g. CTO / VP Engineering"
            leftIcon={<Briefcase className="w-4 h-4 text-zinc-500" />}
            className="min-h-[44px]"
          />

          <Input
            label="Industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="e.g. Software / Enterprise SaaS"
            className="min-h-[44px]"
          />

          <Select
            label="Company Size"
            name="company_size"
            value={formData.company_size}
            onChange={handleChange}
            options={COMPANY_SIZE_OPTIONS}
          />
        </div>
      </div>

      {/* 3. Deal & Pipeline Details */}
      <div className="space-y-3 pt-4 border-t border-[#222228]">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pipeline & Valuation</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Lead Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
          />

          <Select
            label="Acquisition Source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            options={SOURCE_OPTIONS}
          />

          <Input
            label="Estimated Deal Value ($)"
            type="number"
            name="estimated_value"
            value={formData.estimated_value}
            onChange={handleChange}
            placeholder="e.g. 50000"
            min="0"
            step="100"
            leftIcon={<DollarSign className="w-4 h-4 text-zinc-500" />}
            className="min-h-[44px]"
          />
        </div>
      </div>

      {/* 4. Notes */}
      <div className="space-y-2 pt-4 border-t border-[#222228]">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Internal Intelligence Notes</span>
        </div>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Add background context, buyer pain points, key decision maker notes..."
          className="w-full px-4 py-3 bg-[#111113] border border-[#2A2A2E] rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-colors custom-scrollbar"
        />
      </div>

      {/* Footer Buttons: Cancel & Submit */}
      <div className="flex items-center justify-end space-x-3 pt-5 border-t border-[#222228]">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-w-[100px] border-[#2A2A2E] text-zinc-300 hover:bg-[#222225] font-semibold"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="min-w-[140px] bg-[#FF7A00] hover:bg-[#FF8C1A] text-white border-none font-bold shadow-lg shadow-orange-500/20"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
