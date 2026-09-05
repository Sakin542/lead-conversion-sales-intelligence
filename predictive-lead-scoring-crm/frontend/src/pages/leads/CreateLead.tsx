import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LeadForm from '../../components/leads/LeadForm';
import leadService from '../../services/leadService';
import { LeadFormData } from '../../types/lead';
import { ArrowLeft } from 'lucide-react';

export const CreateLead: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: LeadFormData) => {
    setIsSubmitting(true);
    try {
      await leadService.createLead(formData);
      navigate('/leads');
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
            onClick={() => navigate('/leads')}
            className="p-2 rounded-xl bg-[#171718] border border-[#2A2A2E] text-zinc-400 hover:text-white hover:bg-[#29292C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create New Lead</h1>
            <p className="text-xs text-zinc-400">Add a new prospect to your sales database</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-[#171718] border border-[#2A2A2E] rounded-2xl shadow-xl">
          <LeadForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/leads')}
            submitLabel="Create Lead"
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateLead;

