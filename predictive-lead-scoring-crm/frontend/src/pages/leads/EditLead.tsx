import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LeadForm from '../../components/leads/LeadForm';
import leadService from '../../services/leadService';
import { Lead, LeadFormData } from '../../types/lead';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const EditLead: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    leadService
      .getLead(id)
      .then((res) => {
        setLead(res.data);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load lead details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (formData: LeadFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await leadService.updateLead(id, formData);
      navigate(`/leads/${id}`);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/leads/${id || ''}`)}
            className="p-2 rounded-lg bg-[#111111] border border-[#222222] text-zinc-400 hover:text-white hover:bg-[#151515] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Edit Lead {lead ? `— ${lead.first_name} ${lead.last_name}` : ''}
            </h1>
            <p className="text-xs text-zinc-400">Update lead details and pipeline status</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center bg-[#111111] border border-[#222222] rounded-xl flex flex-col items-center justify-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-xs text-zinc-400">Loading lead data...</p>
          </div>
        ) : error || !lead ? (
          <div className="p-6 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error || 'Lead not found.'}</span>
          </div>
        ) : (
          <div className="p-6 bg-[#111111] border border-[#222222] rounded-xl shadow-xl">
            <LeadForm
              initialValues={{
                first_name: lead.first_name,
                last_name: lead.last_name,
                email: lead.email,
                phone: lead.phone || '',
                company: lead.company,
                job_title: lead.job_title || '',
                source: lead.source || '',
                status: lead.status,
                industry: lead.industry || '',
                company_size: lead.company_size || '',
                estimated_value: lead.estimated_value || '',
                notes: lead.notes || '',
              }}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/leads/${id}`)}
              submitLabel="Save Changes"
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditLead;
