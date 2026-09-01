import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LeadTable from '../../components/leads/LeadTable';
import LeadFilters from '../../components/leads/LeadFilters';
import { Lead, LeadFormData } from '../../types/lead';
import leadService from '../../services/leadService';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import LeadForm from '../../components/leads/LeadForm';
import { Plus, AlertCircle, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export const Leads: React.FC = () => {
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters State
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLeads({
        page,
        per_page: 15,
        search,
        status: statusFilter,
        source: sourceFilter,
        sort: 'created_at',
        direction: 'desc',
      });

      setLeads(response.data || []);
      setTotalPages(response.pagination?.last_page || 1);
      setTotalLeads(response.pagination?.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Unable to load leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter, sourceFilter]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchLeads();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSourceFilter('');
    setPage(1);
  };

  const handleCreateLead = async (formData: LeadFormData) => {
    setIsSubmitting(true);
    try {
      await leadService.createLead(formData);
      setIsCreateModalOpen(false);
      fetchLeads();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      await leadService.deleteLead(leadToDelete.id);
      setLeadToDelete(null);
      fetchLeads();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete lead.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Lead Management</h1>
            <p className="text-xs text-slate-400">
              Create, search, filter, and track all prospective leads in your pipeline.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 shrink-0 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </Button>
        </div>

        {/* Filters */}
        <LeadFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          sourceFilter={sourceFilter}
          onSourceChange={(val) => {
            setSourceFilter(val);
            setPage(1);
          }}
          onReset={handleResetFilters}
        />

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchLeads}
              className="text-xs text-rose-400 hover:text-white font-bold underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table Content / Loading / Empty State */}
        {loading ? (
          <div className="py-20 text-center bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-xs text-slate-400 font-medium">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 bg-slate-900/40 border border-slate-800/80 rounded-xl">
            <EmptyState
              icon={<Users className="w-10 h-10 text-slate-500" />}
              title="No leads found"
              description="Start building your sales pipeline by adding your first lead."
              action={{
                label: "+ Add Lead",
                onClick: () => setIsCreateModalOpen(true),
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <LeadTable
              leads={leads}
              onView={(lead) => navigate(`/leads/${lead.id}`)}
              onEdit={(lead) => navigate(`/leads/${lead.id}/edit`)}
              onDelete={(lead) => setLeadToDelete(lead)}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs text-slate-400">
                <span>
                  Showing page <strong className="text-white">{page}</strong> of{' '}
                  <strong className="text-white">{totalPages}</strong> ({totalLeads} total leads)
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Lead Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Lead"
        >
          <LeadForm
            onSubmit={handleCreateLead}
            onCancel={() => setIsCreateModalOpen(false)}
            submitLabel="Create Lead"
            isSubmitting={isSubmitting}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!leadToDelete}
          onClose={() => setLeadToDelete(null)}
          title="Delete Lead"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete lead{' '}
              <strong className="text-white font-bold">
                {leadToDelete?.first_name} {leadToDelete?.last_name}
              </strong>{' '}
              from <strong className="text-white font-bold">{leadToDelete?.company}</strong>?
            </p>
            <p className="text-xs text-rose-400">This action cannot be undone.</p>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <Button
                variant="secondary"
                onClick={() => setLeadToDelete(null)}
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

export default Leads;

