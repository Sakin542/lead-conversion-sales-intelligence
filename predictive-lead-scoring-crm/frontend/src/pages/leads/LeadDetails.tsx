import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LeadStatusBadge from '../../components/leads/LeadStatusBadge';
import ActivityTimeline from '../../components/leads/ActivityTimeline';
import leadService from '../../services/leadService';
import activityService from '../../services/activityService';
import { Lead, LeadActivity, ActivityFormData } from '../../types/lead';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  DollarSign,
  Calendar,
  AlertCircle,
  Tag,
  Users,
} from 'lucide-react';

export const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLeadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await leadService.getLead(id);
      setLead(res.data);

      const actRes = await activityService.getLeadActivities(id);
      setActivities(actRes.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load lead details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const handleAddActivity = async (data: ActivityFormData) => {
    if (!id) return;
    await activityService.createActivity(id, data);
    const actRes = await activityService.getLeadActivities(id);
    setActivities(actRes.data || []);
  };

  const handleDeleteActivity = async (activityId: number) => {
    await activityService.deleteActivity(activityId);
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
  };

  const handleDeleteLead = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await leadService.deleteLead(id);
      navigate('/leads');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete lead.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (val?: number | string | null) => {
    if (!val) return '$0.00';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num)
      ? '$0.00'
      : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/leads')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {lead ? `${lead.first_name} ${lead.last_name}` : 'Lead Details'}
              </h1>
              <p className="text-xs text-slate-400">
                {lead ? `${lead.job_title || 'Lead'} at ${lead.company}` : 'Viewing prospect file'}
              </p>
            </div>
          </div>

          {lead && (
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/leads/${lead.id}/edit`)}
                className="flex items-center space-x-1.5"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Lead</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            </div>
          )}
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="py-20 text-center bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-xs text-slate-400">Loading lead file...</p>
          </div>
        ) : error || !lead ? (
          <div className="p-6 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error || 'Lead not found.'}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Lead Info Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-xl shrink-0">
                    {lead.first_name.charAt(0)}
                    {lead.last_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-snug">
                      {lead.first_name} {lead.last_name}
                    </h2>
                    <p className="text-xs text-slate-400">{lead.job_title || 'No title specified'}</p>
                    <div className="mt-2">
                      <LeadStatusBadge status={lead.status} />
                    </div>
                  </div>
                </div>

                {/* Key Attributes List */}
                <div className="space-y-3 text-xs pt-4 border-t border-slate-800/60">
                  <div className="flex items-center text-slate-300">
                    <Mail className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
                    <a href={`mailto:${lead.email}`} className="hover:text-indigo-400 transition-colors truncate">
                      {lead.email}
                    </a>
                  </div>

                  {lead.phone && (
                    <div className="flex items-center text-slate-300">
                      <Phone className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
                      <span>{lead.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center text-slate-300">
                    <Building className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
                    <span className="font-semibold text-slate-200">{lead.company}</span>
                  </div>

                  {lead.industry && (
                    <div className="flex items-center text-slate-300">
                      <Tag className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
                      <span>Industry: {lead.industry}</span>
                    </div>
                  )}

                  {lead.company_size && (
                    <div className="flex items-center text-slate-300">
                      <Users className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
                      <span>Size: {lead.company_size}</span>
                    </div>
                  )}

                  <div className="flex items-center text-slate-300">
                    <DollarSign className="w-4 h-4 text-emerald-400 mr-3 shrink-0" />
                    <span>Est. Value: </span>
                    <strong className="text-emerald-400 ml-1">{formatCurrency(lead.estimated_value)}</strong>
                  </div>

                  {lead.source && (
                    <div className="flex items-center text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
                      <span>Source: {lead.source}</span>
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                {lead.notes && (
                  <div className="pt-4 border-t border-slate-800/60 space-y-1.5">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Notes
                    </h4>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                      {lead.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Activity Timeline */}
            <div className="lg:col-span-2">
              <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <ActivityTimeline
                  activities={activities}
                  onAddActivity={handleAddActivity}
                  onDeleteActivity={handleDeleteActivity}
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Lead"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete lead{' '}
              <strong className="text-white font-bold">
                {lead?.first_name} {lead?.last_name}
              </strong>
              ?
            </p>
            <p className="text-xs text-rose-400">
              This will permanently delete the lead and all associated activities and deals.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteLead}
                isLoading={isDeleting}
              >
                Delete Lead
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default LeadDetails;
